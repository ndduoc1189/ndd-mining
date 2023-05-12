const fs = require('fs')
const commonFunctions = require('./helper/commonFunctions');
const path = require( "path" );
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
    console.log(userConfig);
    // const miningPath = path.join(__dirname, `../contents/${userConfig.coinMining}/mining.js`);
    // fs.access(miningPath, fs.F_OK, (err) => {
    //   if (err) {
    //     console.error(miningPath+' does not exist');
    //     console.error(err)
    //     return
    //   }
    // });
  
    // const mining = require(miningPath);
    // mining(miningProcess,userConfig);

  }catch (err) {
    console.error(err);
  }
}


async function  RegisterDevice(){
  let device = {
    deviceName: await commonFunctions.getProp('ro.product.model'),
    
  }
  console.log(device);
}
