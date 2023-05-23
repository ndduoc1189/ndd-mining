const si = require('systeminformation');

async function getCPUInfo() {
  try {
    // Lấy thông tin CPU
    const system = await si.system();
    console.log('system:', system);
    const cpuInfo = await si.cpu();
    console.log('Number of CPU Cores:', cpuInfo);

    //Lấy thông tin tải CPU
    const currentLoad = await si.currentLoad();
    console.log(currentLoad.currentload)
    if (typeof currentLoad.currentload !== 'undefined') {
      console.log('CPU Usage:', currentLoad.currentload.toFixed(2), '%');
    }
    
    // Lấy thông tin nhiệt độ CPU
    const sensors = await si.cpuTemperature();
    console.log(sensors)
    if (typeof sensors.main !== 'undefined') {
      const temperature = sensors.main;
      console.log('CPU Temperature:', temperature.toFixed(2), '°C');
    }
    
    // Lấy thông tin điện áp tiêu thụ CPU
    const voltage = await si.cpuCurrentSpeed();
    console.log(voltage)
    if (typeof voltage.voltcore !== 'undefined') {
      console.log('CPU Voltage:', voltage.voltcore.toFixed(2), 'V');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Gọi hàm lấy thông tin CPU
getCPUInfo();
