const spawn = require('child_process').spawn;
const path = require( "path" );
const userConfig = require('../userConfig.json');

module.exports = function runMining(miningProcess) {
    const filePath  =path.join(__dirname,'./astrominer')
    console.log('Start mining ${userConfig.coinMining}');
    miningProcess = spawn(filePath,userConfig.miningConfig.param , { stdio: 'inherit' });
}