/** @typedef {import('../types').IMonoDevInfo} IDevInfo */
const shell = require('shelljs');
const { getCmdKeywordName, getNameData, helMonoLog } = require('../util');
const { genPnpmCmdAndRun } = require('./cmd');

/**
 * 执行 npm start .tsup xx-lib 命令
 */
exports.execTsup = function (/** @type {IDevInfo} */ devInfo) {
  const keywordName = getCmdKeywordName(3);
  const { pkgName, belongTo, dirName, isSubMod } = getNameData(keywordName, devInfo);
  genPnpmCmdAndRun(pkgName, { belongTo, dirName, isSubMod, scriptCmdKey: 'tsup' });
};
