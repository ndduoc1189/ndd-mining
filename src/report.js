const commonFunctions = require('./helper/commonFunctions');
const axios = require('axios');
const globalConfig = require("./config/global");

let userConfig;
let deviceConfig;
let reportUrl;


Run();
async function Run(){
    userConfig = await commonFunctions.getUserConfig();
    deviceConfig = await commonFunctions.getDeviceConfig();
    reportUrl = `${globalConfig.apiURL}/mining/check/${userConfig.userId}/${deviceConfig.deviceId}`
    await axios.post(reportUrl, deviceConfig);

    await sendReport();
}

async function sendReport(){
    try {
        
        
        const data = {
            sshUser: await commonFunctions.getUserSSH(),
            localIp : commonFunctions.getDeviceIP(),
            cpuUse: await commonFunctions.getCpuUse(),
            model: await commonFunctions.getProp("ro.product.model"),
        }
        await axios.post(reportUrl, data);
        console.log(data.model);
        console.log(`Da gui thong tin:${deviceConfig.deviceName} | ${data.localIp} | cpu(%): ${data.cpuUse}`);
    } catch (error) {
        console.log(error)
    } finally {
        const timeOut  =getRandomInt(30000,90000);
        console.log(`Gui lai thong tin sau: ${timeOut/1000}s!`);
        await commonFunctions.delay(timeOut)
        await sendReport();
    }


}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
  }



