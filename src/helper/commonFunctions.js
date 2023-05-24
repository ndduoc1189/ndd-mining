const { promisify } = require('util');
const path = require("path");
const execFileAsync = promisify(require('node:child_process').execFile);
const exec = require('child_process').exec;
const axios = require('axios');
const globalConfig = require("../config/global");

var ip = require("ip");
const osu = require('node-os-utils');

const fs = require('fs');
const exists = promisify(fs.exists);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);


module.exports = {
  async getProp(key) {
    try {
      const { stdout, stderr } = await promisify(exec)(`getprop ${key}`);
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
    let userConfig;
  
    // Kiểm tra xem file cấu hình đã tồn tại hay chưa
    if (!await exists(globalConfig.configPath)) {
      const reader = require("readline-sync"); //npm install readline-sync
      
      while (!userConfig) {
        let username = await reader.question("Nhap thong tin User: ");
        const response = await axios.get(`${globalConfig.apiURL}/user/get/${username}`);
        const data = response.data;
  
        if (data.data) {
          userConfig = data.data;
          await fs.promises.writeFile(globalConfig.configPath, JSON.stringify(userConfig));
          return userConfig;
        } else {
          console.log("User khong ton tai!");
        }
      }
    } else {
      let rawdata = fs.readFileSync(globalConfig.configPath);
      userConfig = JSON.parse(rawdata);
      const response = await axios.get(`${globalConfig.apiURL}/user/get/${userConfig.userName}`);
      const data = response.data;

      if (data.data) {
        userConfig = data.data;

      }
      return userConfig;
    }
  },
  async getDeviceConfig() {
    let deviceConfig;
    let isCreate = false;
    let deviceSerial = await this.getProp("ro.serialno");

    if (deviceSerial && await exists(globalConfig.deviceConfig)) {
      deviceConfig = JSON.parse(await readFile(globalConfig.deviceConfig));
      deviceConfig.adbWifi = await this.checkADB();
      deviceConfig.root = await this.checkRootPermissions();
      if (deviceSerial !== deviceConfig.deviceId) {
        isCreate = true;
      }
    } else {
      isCreate = true;
    }

    if (isCreate) {
      deviceConfig = {
        deviceId: deviceSerial || require("shortid").generate(),
        deviceName: await this.getProp("ro.product.model"),
        sshUser: await this.getUserSSH(),
        localIp: this.getDeviceIP(),
        cpuUse: 0,
        cpuCores: this.getCpuCores(),
        adbWifi: await this.checkADB(),
        model: await this.getProp("ro.product.model"),
      };
      await writeFile(globalConfig.deviceConfig, JSON.stringify(deviceConfig));
    }

    return deviceConfig;
  }
  ,
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
    try {
      return ip.address();
    } catch (ex) {
      return ex;
    }
  },
  async getUserSSH() {
    const { stdout, error } = await promisify(exec)("whoami");
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
  async checkADB() {
    try {
      const localIp = "127.0.0.1";
      const execAsync = promisify(exec);
      const { stdout } = await execAsync(`adb connect ${localIp}`);
      if (stdout.includes(`connected to ${localIp}`)) {
        const connectedDevices = await execAsync('adb devices');
        if (connectedDevices.stdout.includes(localIp)) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.log('Lỗi khi chạy lệnh adb:', error);
      return false;
    }
  },
  // Kiểm tra xem thiết bị có quyền root hay không
  checkRootPermission() {
    return new Promise((resolve) => {
      exec('su -c "id"', (error, stdout) => {
        if (stdout.toLowerCase().includes('uid=0')) {
          resolve(true); // Thiết bị có quyền root
        } else {
          resolve(false); // Thiết bị không có quyền root
        }
      });
    });
  },
  async delay(delayInms) {
    return new Promise(resolve => setTimeout(resolve, delayInms));
  }
}