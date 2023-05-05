const util = require('node:util');
const path = require( "path" );
const execFileAsync = util.promisify(require('node:child_process').execFile);

const termuxpath="/data/data/com.termux/files/usr/bin/";
const propPath =termuxpath+'getprop';

const propGetResult = async(command)=>{
    const { stdout,error } = await execFileAsync(propPath, command);
    if (error) {
        throw error;
      }
    return stdout;
}
module.exports = {
    async getProp(key){
        console.log(`getProp ${key}`); 
        return await propGetResult({key});
    }
}