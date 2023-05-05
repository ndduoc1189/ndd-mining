const spawn = require('child_process').spawn;
const path = require( "path" );
const userConfig = require('../userConfig.json');

module.exports = function run() {
    const filePath  =path.join(__dirname,'./astrominer')
    console.log('Start mining ${userConfig.coinMining}');
    let child = spawn(filePath,userConfig.miningConfig.param , { stdio: 'inherit' });
}