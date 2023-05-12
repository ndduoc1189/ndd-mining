const commonFunctions = require('./helper/commonFunctions');
const axios = require('axios');
const globalConfig = require("./config/global");


sendReport();

async function sendReport(){
    try {
        const userConfig = await commonFunctions.getUserConfig();
        const reportUrl = `${globalConfig.apiURL}/mining/check/${userConfig.userId}/${userConfig.deviceId}`
        const data = {
            sshUser: await commonFunctions.getUserSSH(),
            localIp : commonFunctions.getDeviceIP(),
            cpuUse: getCpuUse(),
            model: await commonFunctions.getProp("ro.product.model"),
        }
        await axios.post(reportUrl, data);
        console.log(data.model);
        console.log(`Da gui thong tin:${userConfig.deviceName} | ${data.localIp} | cpu(%): ${data.cpuUse}`);
    } catch (error) {
        console.log(error)
    } finally {
        const timeOut  =getRandomInt(10000,60000);
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

function getCpuUse(){
    const os = require('os');

    // Take the first CPU, considering every CPUs have the same specs
    // and every NodeJS process only uses one at a time.
    const cpus = os.cpus();
    const cpu = cpus[0];

    // Accumulate every CPU times values
    const total = Object.values(cpu.times).reduce(
        (acc, tv) => acc + tv, 0
    );

    // Normalize the one returned by process.cpuUsage() 
    // (microseconds VS miliseconds)
    const usage = process.cpuUsage();
    const currentCPUUsage = (usage.user + usage.system) * 1000;

    // Find out the percentage used for this specific CPU
    const perc = currentCPUUsage / total * 100;
    return perc;
}

