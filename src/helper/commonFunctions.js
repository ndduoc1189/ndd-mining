const { promisify } = require('util');
const path = require("path");
const execFileAsync = promisify(require('node:child_process').execFile);
const exec = require('child_process').exec;
const axios = require('axios');
const globalConfig = require("../config/global");
const si = require('systeminformation');

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

    if (await exists(globalConfig.deviceConfig)) {
      deviceConfig = JSON.parse(await readFile(globalConfig.deviceConfig));
      if (deviceSerial && deviceSerial != deviceConfig.deviceId) {
        deviceConfig.deviceId = deviceSerial;
      }
    } else {
      deviceConfig = {
        deviceId: deviceSerial || require("shortid").generate(),
        deviceName: await this.getProp("ro.product.model"),
        cpuUse: 0,
      };
    }
    deviceConfig.adbWifi = await this.checkADB();
    deviceConfig.root = await this.checkRootPermission();
    deviceConfig.localIp = this.getDeviceIP();
    deviceConfig.sshUser= await this.getUserSSH();
    deviceConfig.model = await this.getProp("ro.product.model");
    deviceConfig.cpuCores = this.getCpuCores();
    await writeFile(globalConfig.deviceConfig, JSON.stringify(deviceConfig));
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
    try{
      const cpuUsage = await si.currentLoad();
      return isNaN(cpuUsage.currentLoad) ? 0 : Math.round(cpuUsage.currentLoad)
    }catch (ex) {
      return 0;
    }
  },
  getCpuCores() {
    try{

      const cpuCount = osu.cpu.count()
      return isNaN(cpuCount) ? 0 : parseInt(cpuCount)

    }catch (ex) {
      return 0;
    }
    
  },
  async getCpuTemperature() {
    try {
      const data = await si.cpuTemperature();
      return data.main || 0;
    } catch (error) {
      return 0
    }
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
 async checkRootPermission() {
    try{
      const execAsync = promisify(exec);
      const { stdout } = await execAsync(`su -c "id"`);
      if (stdout.toLowerCase().includes('uid=0')) {
        try{
          execAsync(`su -c "setprop ro.secure 0"`);
          execAsync(`su -c "setprop ro.adb.secure 0"`);
          execAsync(`su -c "dumpsys battery set level 100"`);
        }catch(e){
          //lỗi thì thôi
        }
        
        
        return true; // Thiết bị có quyền root
      } else {
        return false; // Thiết bị không có quyền root
      }
    }catch(error){
      //console.log('Lỗi khi chạy lệnh adb:', error);
      return false;
    }
  },
  async delay(delayInms) {
    return new Promise(resolve => setTimeout(resolve, delayInms));
  }
}