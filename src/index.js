const fs = require('fs')
const commonFunctions = require('./helper/commonFunctions');
const path = require( "path" );

runMining();
//RegisterDevice();
function runMining(){
  try{
    const userConfig = require('../contents/userConfig.json');
    const miningPath = path.join(__dirname, `../contents/${userConfig.coinMining}/mining.js`);
    fs.access(miningPath, fs.F_OK, (err) => {
      if (err) {
        console.error(miningPath+' does not exist');
        console.error(err)
        return
      }
    });
  
    const mining = require(miningPath);
    mining();

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
