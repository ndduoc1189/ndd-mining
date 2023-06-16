const path = require('path');
module.exports = {
    binPath :'/data/data/com.termux/files/usr/bin/',
    apiURL:'https://mnapi.hhkorean.com/v1',
    wsURL:'wss://mnapi.hhkorean.com',
    configPath: path.join(__dirname,'../../contents/userconfig.json'),
    deviceConfig: path.join(__dirname,'../../contents/deviceconfig.json'),
    logFile : path.join(__dirname,'../../contents/log-mining.txt'),
}