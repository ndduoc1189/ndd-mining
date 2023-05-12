const util = require('node:util');
const path = require("path");
const execFileAsync = util.promisify(require('node:child_process').execFile);
const exec = require('child_process').exec;
const axios = require('axios');
const globalConfig = require("../config/global");
const fs = require('fs')
var ip = require("ip");

async function exists(path) {
  try {
    return await fs.existsSync(path)
  } catch(ex) {
    console.error(ex);
    return false
  }
}

 function getIp(){
  try{
    return  ip.address();
  }catch(ex){
    return ex;
  }
}


module.exports = {
  async getProp(key) {
    try{
      const { stdout, stderr } = await util.promisify(exec)(`getprop ${key}`);
      if (stderr) {
        return stderr.trim();
      }
      return stdout.trim();
    }catch(ex){
      return ex.stderr.trim();
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
          //Sinh them thong tin thiet bi
          userConfig.deviceId = require('shortid').generate();
          userConfig.deviceName = await this.getUserSSH();

          await fs.promises.writeFile(globalConfig.configPath, JSON.stringify(userConfig));
          return userConfig;
        } else {
          console.log("User khong ton tai!");
        }

      }
    }else{
      let rawdata = fs.readFileSync(globalConfig.configPath);
      userConfig = JSON.parse(rawdata);
      return userConfig;
    }
  },
  async removeUserConfig(){
    try
    {
      if (await exists(globalConfig.configPath)){
        await fs.unlinkSync(globalConfig.configPath)
      }
      console.log("Da xoa thong tin user");
    }catch(ex){
      console.error(ex);
    }

  },
  getDeviceIP : () => {
    return getIp();
  },
  getUserSSH: async() => {
    const { stdout, error } = await util.promisify(exec)("whoami");
    if (error) {
      return error;
    }
    return stdout.trim();
  },
  delay : async (delayInms) => {
    return new Promise(resolve => setTimeout(resolve, delayInms));
  }
}