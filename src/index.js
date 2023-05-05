const commonFunctions = require('./helper/commonFunctions');

RegisterDevice();

async function  RegisterDevice(){
  let device = {
    deviceName: await commonFunctions.getProperty('ro.product.model'),
    
  }
  console.log(device);
  
}