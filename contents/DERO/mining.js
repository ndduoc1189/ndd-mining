const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const path = require("path");
const userConfig = require('../userConfig.json');

module.exports = function runMining(miningProcess) {
    try {
        const filePath = path.join(__dirname, './astrominer')

        exec(`chmod u+x ${filePath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            console.log(`Chmod ${filePath}`);
        });

        console.log(`Start mining ${userConfig.coinMining}`);
        miningProcess = spawn(filePath, userConfig.miningConfig.param, { stdio: 'inherit' });
        
    } catch (ex) {
        if (miningProcess) {
            miningProcess.kill();
        }
        console.error(ex);
    }
}