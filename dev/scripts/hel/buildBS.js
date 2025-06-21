const devInfo = require('dev-info');
const { prepareHelEntry } = require('../../mono-helper');

// 标识构建产物要输出到 hel_dist 目录
process.env.HEL = '1';
// 标识要同时构建 hel 前后端（浏览器端、node端）模块
process.env.HEL_BS = '1';

prepareHelEntry(devInfo);
// call cra build
require('../build');
