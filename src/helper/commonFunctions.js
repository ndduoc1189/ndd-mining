const util = require('node:util');
const path = require("path");
const execFileAsync = util.promisify(require('node:child_process').execFile);
const exec = require('child_process').exec;
const axios = require('axios');
const globalConfig = require("../config/global");
const fs = require('fs')
var ip = require("ip");
const osu = require('node-os-utils')

async function exists(path) {
  try {
    return await fs.existsSync(path)
  } catch (ex) {
    console.error(ex);
    return false
  }
}

function getIp() {
  try {
    return ip.address();
  } catch (ex) {
    return ex;
  }
}


module.exports = {
  async getProp(key) {
    try {
      const { stdout, stderr } = await util.promisify(exec)(`getprop ${key}`);
      if (stderr) {
        return null;
      }
      return stdout.trim();
    } catch (ex) {
      return null;
    }
  },
  killProcess(pid) {
    exec(`chmod u+x ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Kill process ${pid} error: ${error}`);
        return;
      }
      console.log(`Killed process ${pid}`);
    });
  },
  async getUserConfig() {
    let userConfig
    if (!await exists(globalConfig.configPath)) {
      const reader = require("readline-sync"); //npm install readline-sync
      while (!userConfig) {
        let username = await reader.question("Nhap thong tin User: ");
        const data = await axios.get(`${globalConfig.apiURL}/user/get/${username}`)
        if (data.data.data) {
          userConfig = data.data.data;
          await fs.promises.writeFile(globalConfig.configPath, JSON.stringify(userConfig));
          return userConfig;
        } else {
          console.log("User khong ton tai!");
        }
      }
    } else {
      let rawdata = fs.readFileSync(globalConfig.configPath);
      userConfig = JSON.parse(rawdata);
      return userConfig;
    }
  },
  async getDeviceConfig() {
    let deviceConfig;
    let deviceSerial = this.getProp("ro.serialno");
    let isCreate =false;
    if (await exists(globalConfig.deviceConfig)) {
      let rawdata = fs.readFileSync(globalConfig.deviceConfig);
      deviceConfig = JSON.parse(rawdata);
      if(deviceSerial && deviceSerial!= deviceConfig.deviceId){
        isCreate = true;
      }
    } 
    if(isCreate) {
      deviceConfig = {
        deviceId: this.getProp("ro.serialno") || require("shortid").generate(),
        deviceName: await this.getProp("ro.product.model"),
        sshUser: await this.getUserSSH(),
        localIp: this.getDeviceIP(),
        cpuUse: 0,
        cpuCores: this.getCpuCores(),
        model: await this.getProp("ro.product.model"),
      }
      await fs.promises.writeFile(globalConfig.deviceConfig, JSON.stringify(deviceConfig));
    }
    return deviceConfig;
  },
  async removeConfig(isRemoveUser) {
    try {
      if (isRemoveUser && await exists(globalConfig.configPath)) {
        await fs.unlinkSync(globalConfig.configPath)
        console.log("Da xoa thong tin user");
      }

      if (await exists(globalConfig.deviceConfig)) {
        await fs.unlinkSync(globalConfig.deviceConfig)
        console.log("Da xoa thong tin thiet bi");
      }

    } catch (ex) {
      console.error(ex);
    }

  },
  getDeviceIP() {
    return getIp();
  },
  async getUserSSH() {
    const { stdout, error } = await util.promisify(exec)("whoami");
    if (error) {
      return error;
    }
    return stdout.trim();
  },
  async getCpuUse() {
    const cpuPercentage = await osu.cpu.usage();
    return cpuPercentage;
  },
  getCpuCores() {
    return osu.cpu.count()
  },
  async delay(delayInms) {
    return new Promise(resolve => setTimeout(resolve, delayInms));
  }
}