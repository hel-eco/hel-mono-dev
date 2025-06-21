const devInfo = require('dev-info');
const { prepareHelEntry } = require('../../mono-helper');

process.env.HEL = '1';
/** 标识以 hel 模式启动应用 */
process.env.HEL_START = '1';
prepareHelEntry(devInfo);
// call cra start
require('../start');
