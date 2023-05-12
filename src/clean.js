const commonFunctions = require('./helper/commonFunctions');
const args = process.argv;
commonFunctions.removeConfig(args.includes('a'));
