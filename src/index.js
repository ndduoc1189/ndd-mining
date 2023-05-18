const fs = require('fs')
const commonFunctions = require('./helper/commonFunctions');
const path = require( "path" );
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
let miningProcess;
let userConfig;

runMining();

process.on('SIGINT', () => {
  if(miningProcess){
    //commonFunctions.killProcess(miningProcess.pid);
    console.log('Stop mining process');
    miningProcess.kill();
  }
})
//RegisterDevice();
async function runMining(){
  try{
    userConfig = await commonFunctions.getUserConfig();
    const miningPath = path.join(__dirname, `../contents/${userConfig.coinMining}/mining.js`);
    fs.access(miningPath, fs.F_OK, (err) => {
      if (err) {
        console.error(miningPath+' does not exist');
        console.error(err)
        return
      }
    });
    const mining = require(miningPath);
    mining(miningProcess,userConfig);
    fixHash();
  }catch (err) {
    console.error(err);
  }
}
async function runAdbCommand(command) {
  try {
    const { stdout } = await exec(`adb -s 127.0.0.1:5555 ${command}`);
    return stdout.trim();
  } catch (error) {
    console.error(`Lỗi khi chạy lệnh adb ${command}:`, error);
    return '';
  }
}

async function turnOffScreen() {
  try {
    const x = 540; // Thay đổi x theo tọa độ phù hợp
    const y = 100; // Thay đổi y theo tọa độ phù hợp
    await runAdbCommand(`shell input tap ${x} ${y}`);
    await runAdbCommand(`shell input tap ${x} ${y}`);
    console.log('Màn hình đã được tắt');
  } catch (error) {
    console.error('Lỗi khi tắt màn hình:', error);
  }
}

async function turnOnScreen() {
  try {
    await runAdbCommand('shell input keyevent 26');
    console.log('Màn hình đã được bật');
  } catch (error) {
    console.error('Lỗi khi bật màn hình:', error);
  }
}

async function fixHash() {
  try {
    await new Promise(resolve => setTimeout(resolve, 10000));
    await turnOffScreen();
    console.log('Đang chờ 5 giây...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    await turnOnScreen();
  } catch (error) {
    console.error('Lỗi:', error);
  }
}
