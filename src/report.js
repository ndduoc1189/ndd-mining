async function Run() {
    userConfig = await commonFunctions.getUserConfig();
    deviceConfig = await commonFunctions.getDeviceConfig();
    await connectWS();
    await commonFunctions.delay(10000);
    await sendReport();
}

async function connectWS() {
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
        });

        // Xử lý khi kết nối đóng
        ws.addEventListener('close', () => {
            console.log('Worker disconnected from WebSocket server');
            // Thử kết nối lại sau một khoảng thời gian
            setTimeout(connectWS, 5000);
        });
    } catch (ex) {
        console.log(ex);
        // Nếu có lỗi, chờ 5 giây trước khi thử kết nối lại
        await commonFunctions.delay(5000);
        await connectWS();
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
            localIp: commonFunctions.getDeviceIP(),
            cpuUse: await commonFunctions.getCpuUse(),
        }

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ command: 'CLIENT_REPORT', data: data }));
            console.log(`Da gui thong tin: ${data.localIp} | cpu(%): ${data.cpuUse}`);
        }

    } catch (error) {
        console.log(error)
    } finally {
        const timeOut = getRandomInt(60000, 120000);
        console.log(`Gui lai thong tin sau: ${timeOut / 1000}s!`);
        await commonFunctions.delay(timeOut)
        await sendReport();
    }
}

// Xử lý sự kiện nhấn Ctrl+C
process.on('SIGINT', () => {
    // Đặt biến cờ thành false khi nhấn Ctrl+C
    isSendReport = false;
    console.log('Stopping the program...');
    process.exit();
});
