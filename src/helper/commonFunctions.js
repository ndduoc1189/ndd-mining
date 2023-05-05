const util = require('node:util');
const path = require( "path" );
const { exec  } = require('node:child_process');
const execFileAsync = util.promisify(require('node:child_process').execFile);
const execFile = require('node:child_process').execFile;
const spawn = require('child_process').spawn;

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
    },
    runMining(){
        console.log(`Run mining astrominer`); 
        let child = spawn(path.resolve('./contents/dero/astrominer'), ['-w','deroi1qyzlxxgq2weyqlxg5u4tkng2lf5rktwanqhse2hwm577ps22zv2x2q9pvfz92xmuult2g6ux5gdq3nrkqk','-r','community-pools.mysrv.cloud:10300','-r2','dero.friendspool.club:10300','-r1','dero.rabidmining.com:10300','-p','rpc']);
        // You can also use a variable to save the output 
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', function(data) {
            //Here is where the output goes
            console.log('stdout: ' + data);

        });
        child.stderr.setEncoding('utf8');
        child.stderr.on('data', function(data) {
            //Here is where the error output goes
            console.log('stderr: ' + data);
        });
        child.on('close', function(code) {
            //Here you can get the exit code of the script
            console.log('closing code: ' + code);
        });
        process.on('exit', function() {
            // console.log('killing', children.length, 'child processes');
            // children.forEach(function(child) {
            //   child.kill();
            // });
            console.log("Stop mining process");
            child.kill('SIGINT');
          });
          
    }
}