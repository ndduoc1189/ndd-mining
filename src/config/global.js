const path = require('path');
module.exports = {
    binPath :'/data/data/com.termux/files/usr/bin/',
    apiURL:'http://10.0.0.89:8089/v1',
    wsURL:'ws://10.0.0.89:8089',
    configPath: path.join(__dirname,'../../contents/userconfig.json'),
    deviceConfig: path.join(__dirname,'../../contents/deviceconfig.json'),
}