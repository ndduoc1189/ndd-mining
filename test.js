const si = require('systeminformation');

async function getCpuInfo() {
  try {
    const cpuData = await si.cpu();
    const cpuUsage = await si.currentLoad();
    console.log(cpuUsage);
    console.log('CPU Cores:', cpuData.cores);
    console.log('CPU Usage:', cpuUsage.currentLoad.toFixed(2) + '%');
  } catch (error) {
    console.error('Error:', error);
  }
}

getCpuInfo();