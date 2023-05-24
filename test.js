const { exec } = require('child_process');

function getCPUVoltage() {
  return new Promise((resolve, reject) => {
    exec('termux-battery-status', (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      try {
        const batteryStatus = JSON.parse(stdout);
        const voltage = batteryStatus.voltage;
        resolve(voltage);
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}

// Gọi hàm lấy thông tin CPU voltage
getCPUVoltage()
  .then(voltage => {
    console.log('CPU Voltage:', voltage);
  })
  .catch(error => {
    console.error('Error:', error);
  });
