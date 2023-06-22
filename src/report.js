const commonFunctions = require('./helper/commonFunctions');
const axios = require('axios');
const globalConfig = require("./config/global");
const ReconnectWebSocket = require('ws');
const WebSocket = require('ws');
let userConfig, deviceConfig, ws;

Run();

async function Run() {
    userConfig = await commonFunctions.getUserConfig();
    deviceConfig = await commonFunctions.getDeviceConfig();
    //deviceConfig.deviceId = require("shortid").generate();
    connectWS();
    await commonFunctions.delay(10000);
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
            console.log('Đã kết nối đến máy chủ');
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
            //console.log(data);
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
            console.log('Mất kết nối máy chủ, Kết nối lại sau 5s.');
            // Thử kết nối lại sau một khoảng thời gian
            setTimeout(connectWS, 5000);
        });
    } catch (ex) { 
        console.log(`Lỗi kết nối rồi, kết nối lại sau 5s`,ex); 
        // Thử kết nối lại sau một khoảng thời gian
        setTimeout(connectWS, 5000);
    }
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
            cpuUse: await commonFunctions.getCpuUse(),
            tempe: await commonFunctions.getCpuTemperature(),
        }
        ws.send(JSON.stringify({ command: 'CLIENT_REPORT', data: data }));
        console.log(`Da gui thong tin: cpu(%): ${data.cpuUse} Nhiet do: ${data.tempe}`);

    } catch (error) {
        console.log(error)
    } finally {
        const timeOut = getRandomInt(20000, 30000);
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
            result.message  = `${ error ? error.message :'' } ${stderr}`;
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
