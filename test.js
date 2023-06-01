const fs = require('fs');

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

// Sử dụng hàm để lấy thông tin
(async () => {
  try {
    const cpuUsage = await getCpuUsage();
    console.log('Phần trăm CPU:', cpuUsage);
  } catch (error) {
    console.error('Lỗi:', error);
  }
})();