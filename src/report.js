const commonFunctions = require('./helper/commonFunctions');
const axios = require('axios');
const globalConfig = require("./config/global");
const ReconnectWebSocket = require('reconnecting-websocket');
const WebSocket = require('ws');
let userConfig, deviceConfig, ws;

Run();

async function Run() {
    userConfig = await commonFunctions.getUserConfig();
    deviceConfig = await commonFunctions.getDeviceConfig();
    connectWS();
    await commonFunctions.delay(10000);
    while (ws && ws.readyState === WebSocket.CLOSED) {
        connectWS();
        await commonFunctions.delay(10000);
    }
    await sendReport();
}
function connectWS() {
    try {
        // Kết nối đến máy chủ WebSocket
        ws = new ReconnectWebSocket(globalConfig.wsURL, [], {
            WebSocket: WebSocket
        });
        // Xử lý khi kết nối được thiết lập
        ws.addEventListener('open', () => {
            console.log('Worker connected to WebSocket server');
            // Gửi yêu cầu đăng ký vào một nhóm cụ thể (ví dụ: 'task-group')
            const data = {
                userId: userConfig.userId,
                deviceId: deviceConfig.deviceId,
                adbWifi: deviceConfig.adbWifi,
                Status: 1,
                localIp: deviceConfig.localIp,
                sshUser: deviceConfig.sshUser,
                cpuCores: deviceConfig.cpuCores,
                root: deviceConfig.root,
            }
            console.log(data);
            ws.send(JSON.stringify({ command: 'CLIENT_REGISTER', data }));
        });

        // Xử lý khi nhận tin nhắn từ máy chủ
        ws.addEventListener('message', (message) => {
            const { command, data } = JSON.parse(message.data);
            switch (command) {
                case 'CLIENT_TASK':
                    console.log(`Thực hiện lệnh ${data.command}`);
                    executeCommand(data);
                    break;
                default:
                    const result = {
                        userId: userConfig.userId,
                        deviceId: deviceConfig.deviceId,
                        command,
                        type: 'error',
                        message: 'Thiết bị chưa thiết lập nhận lệnh này',
                    };
                    ws.send(JSON.stringify({ command: 'CLIENT_TASK_RESULT', data: data }));
                    break;

            }
            if (command === 'exec') {
                executeCommand(data.command);
            }

        });

        // Xử lý khi kết nối đóng
        ws.addEventListener('close', () => {
            console.log('Worker disconnected from WebSocket server');
        });
    } catch (ex) { console.log(ex); }
}

let isSendReport = true;
async function sendReport() {
    try {
        if (!isSendReport) {
            return;
        }
        const data = {
            deviceId: deviceConfig.deviceId,
            userId: userConfig.userId,
            localIp: commonFunctions.getDeviceIP(),
            cpuUse: await commonFunctions.getCpuUse(),
        }
        ws.send(JSON.stringify({ command: 'CLIENT_REPORT', data: data }));
        console.log(`Da gui thong tin: ${data.localIp} | cpu(%): ${data.cpuUse}`);

    } catch (error) {
        console.log(error)
    } finally {
        const timeOut = getRandomInt(60000, 120000);
        console.log(`Gui lai thong tin sau: ${timeOut / 1000}s!`);
        await commonFunctions.delay(timeOut)
        await sendReport();
    }
}
function executeCommand(data) {
    const childProcess = require('child_process');
    childProcess.exec(data.command, (error, stdout, stderr) => {
        const result = {
            userId: userConfig.userId,
            deviceId: deviceConfig.deviceId,
            command:data.command,
            type: 'success',
            message: stdout
        };
        if (error || stderr.length > 0) {
            result.type = 'error';
            result.message  = `${ error ? error.message :'' } {stderr}`;
        }
        ws.send(JSON.stringify({ command: 'CLIENT_TASK_RESULT', data: result }));
    });
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

// Xử lý sự kiện nhấn Ctrl+C
process.on('SIGINT', () => {
    // Đặt biến cờ thành false khi nhấn Ctrl+C
    isSendReport = false;
    console.log('Stopping the program...');
    process.exit();
});
