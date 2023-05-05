const util = require('node:util');
const { exec  } = require('node:child_process');
const execFile = util.promisify(require('node:child_process').execFile);
const termuxpath="/data/data/com.termux/files/usr/bin/";
const propPath =termuxpath+'getprop';
const propGetResult = async(command)=>{
    const { stdout,error } = await execFile(propPath, command);
    if (error) {
        throw error;
      }
    return stdout;
}

module.exports = {
    async getProp(key){
        return await propGetResult({key});
    }
}