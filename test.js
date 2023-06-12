const fs = require('fs');
const si = require('systeminformation');
async function getCpuUsage() {
  try {
    const data = await fs.promises.readFile('/proc/stat', 'utf8');
    const lines = data.trim().split('\n');
    const cpuLine = lines.find(line => line.startsWith('cpu '));
    if (cpuLine) {
      const columns = cpuLine.split(/\s+/);
      const total = columns.slice(1).reduce((acc, val) => acc + parseInt(val), 0);
      const idle = parseInt(columns[4]);
      const usage = ((total - idle) / total) * 100;
      return usage;
    } else {
      throw new Error('Không thể lấy thông tin CPU');
    }
  } catch (error) {
    throw error;
  }
}
async function getCpuTemperature() {
  try {
    const data = await si.cpuTemperature();
    return data.main || 0;
  } catch (error) {
    return 0
  }
}


// Sử dụng hàm để lấy thông tin
(async () => {
  try {
    const cpuUsage = await getCpuTemperature();
    console.log('Nhiệt độ:', cpuUsage);
  } catch (error) {
    console.error('Lỗi:', error);
  }
})();