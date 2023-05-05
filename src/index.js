const commonFunctions = require('./helper/commonFunctions');

//RegisterDevice();
commonFunctions.runMining();

async function  RegisterDevice(){
  let device = {
    deviceName: await commonFunctions.getProp('ro.product.model'),
    
  }
  console.log(device);
  
}