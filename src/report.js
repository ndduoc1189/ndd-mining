const commonFunctions = require('./helper/commonFunctions');
const axios = require('axios');
const globalConfig = require("./config/global");
const WebSocket = require('reconnecting-websocket');
let userConfig, deviceConfig , ws;

Run();

async function Run(){
    
    userConfig = await commonFunctions.getUserConfig();
    deviceConfig = await commonFunctions.getDeviceConfig();
    connectWS();
    await commonFunctions.delay(10000)
    await sendReport();
}
function connectWS() {
    try{
        // Kết nối đến máy chủ WebSocket
        ws = new WebSocket(globalConfig.wsURL);
        // Xử lý khi kết nối được thiết lập
        ws.on('open', () => {
        console.log('Worker connected to WebSocket server');
        // Gửi yêu cầu đăng ký vào một nhóm cụ thể (ví dụ: 'task-group')
        ws.send(JSON.stringify({ command: 'register', data:{userId:userConfig.userId,...deviceConfig}}));
        });

        // Xử lý khi nhận tin nhắn từ máy chủ
        ws.on('message', (message) => {
        console.log(`Received message from server: ${message}`);
        });

        // Xử lý khi kết nối đóng
        ws.on('close', () => {
            console.log('Worker disconnected from WebSocket server');
        });
    }catch(ex){console.log(ex);}
}

async function sendReport(){
    try {
        const data = {
            deviceId: deviceConfig.deviceId,
            userId: userConfig.userId,
            localIp : commonFunctions.getDeviceIP(),
            cpuUse: await commonFunctions.getCpuUse(),
        }
        ws.send(JSON.stringify({ command: 'report',data:data}));
        console.log(`Da gui thong tin: ${data.localIp} | cpu(%): ${data.cpuUse}`);

    } catch (error) {
        console.log(error)
    } finally {
        const timeOut=getRandomInt(6000,12000);
        console.log(`Gui lai thong tin sau: ${timeOut/1000}s!`);
        await commonFunctions.delay(timeOut)
        await sendReport();
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
  }



