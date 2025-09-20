/** @typedef {import('../types').IMonoDevInfo} IDevInfo */
// const { START_CMD_MODES } = require('../consts');
const { getAliasData } = require('../util/alias');
const { helMonoLog } = require('../util');

function getPkgNameFromMayAlias(/** @type {IDevInfo} */ devInfo, mayAlias) {
  let pureKeyword = mayAlias;
  // mayAlias 可能形如: @h:start，需要去掉分号，仅取第一位
  if (mayAlias.includes(':')) {
    const list = mayAlias.split(':');
    const [str1] = list;
    pureKeyword = str1;
  }

  let newKeyword = '';
  const { appConfs } = devInfo;
  const keys = Object.keys(appConfs);
  for (const key of keys) {
    const conf = appConfs[key];
    if (conf.alias === pureKeyword) {
      newKeyword = key;
      break;
    }
  }

  // 在 dev-info 里未定义，从模块目录里去推导
  if (!newKeyword) {
    const { alias2PkgList } = getAliasData(devInfo);
    const list = alias2PkgList[mayAlias];
    if (list && list.length) {
      if (list.length > 1) {
        const errMsg =
          `these packages(${list.join(',')}) have the same alias ${mayAlias}, you can not operate mod with alias`
          + `, or you can specify alias in dev-info config if you want to use alias ability!`;
        throw new Error(errMsg);
      }
      newKeyword = list[0];
    }
  }

  return newKeyword;
}

/**
 * 分析可能带有冒号的名字，
 * 名字包含了冒号时，是 {dirName}:{mode} 格式
 */
function analyzeColonKeywordName(/** @type {IDevInfo} */ devInfo, rawKeywordName, rawScriptCmdKey) {
  let keywordName = rawKeywordName;
  let scriptCmdKey = rawScriptCmdKey;
  let forEX = false;

  // 名字包含了启动方式，例如 hub:hel
  if (rawKeywordName.includes(':')) {
    const list = rawKeywordName.split(':');
    const [str1, ...rest] = list;
    /** @type string */
    const mode = rest.join(':');
    keywordName = str1;

    helMonoLog(`keywordName ${keywordName}, rawScriptCmdKey ${rawScriptCmdKey}, mode ${mode}`);

    // 是 xxx:proxy 时，启动的是 .hel/apps或.hel/packages 下的应用，cmdKey 无需再保留后缀
    if (mode === 'proxy') {
      scriptCmdKey = rawScriptCmdKey;
    } else if (rawScriptCmdKey === 'start') {
      // 除去 START_CMD_MODES 之外的，根目录执行 npm start xx:yy:zz 均表示尝试执行子项目的 yy:zz 命令
      // scriptCmdKey = START_CMD_MODES.includes(mode) ? `${rawScriptCmdKey}:${mode}` : mode;
      scriptCmdKey = `${rawScriptCmdKey}:${mode}`;
      if (
        mode.includes(':') // 把  start:build:hel 修正为 build:hel
        || mode === 'build' // 把 start:build 修正为 build
        || mode.startsWith('test') //把 start:test... 修正为 test...
      ) {
        // 把  start:build:hel 修正为 build:hel
        scriptCmdKey = mode;
      }

      // 启动对应的ex目录
      if (mode === 'helex' && !keywordName.endsWith('-ex')) {
        keywordName = `${keywordName}-ex`;
        scriptCmdKey = 'start';
        forEX = true;
      }
    } else {
      scriptCmdKey = `${rawScriptCmdKey}:${mode}`;
    }
  }

  const pkgName = getPkgNameFromMayAlias(devInfo, rawKeywordName);
  if (pkgName) {
    helMonoLog(`found alias from ${rawKeywordName}, we will use its package name ${pkgName}`);
    keywordName = pkgName;
  }
  helMonoLog(`result:  keywordName ${keywordName}, scriptCmdKey ${scriptCmdKey}`);

  return { keywordName, scriptCmdKey, forEX };
}

exports.extractCmdData = function (/** @type {IDevInfo} */ devInfo, rawKeywordName, startOrBuild) {
  const data = analyzeColonKeywordName(devInfo, rawKeywordName, startOrBuild);
  return data;
};
