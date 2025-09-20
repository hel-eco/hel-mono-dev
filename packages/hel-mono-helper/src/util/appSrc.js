/** @typedef {import('../types').IMonoDevInfo} IDevInfo */
const fs = require('fs');
const path = require('path');
const jsonc = require('jsonc-parser');
const { getTsConfigAlias } = require('./alias');
const { getMonoRootInfo } = require('./rootInfo');

function getTsConfigJson(appSrc) {
  const strList = appSrc.split(path.sep);
  const tsConfigJsonPath = path.join(strList.slice(0, strList.length - 1).join(path.sep), './tsconfig.json');
  let tsConfigJson = null;
  if (fs.existsSync(tsConfigJsonPath)) {
    const str = fs.readFileSync(tsConfigJsonPath, { encoding: 'utf-8' });
    tsConfigJson = jsonc.parse(str);
  }
  return tsConfigJson;
}

/**
 * 获取 tsconfig.json 里的 alias 别名，注：目前 hel-mono 架构暂支持对模块配置一个别名，故只会读取其中一个
 */
function getTsConfigAliasByAppSrc(devInfo, appSrc) {
  let targetAlias = '';
  const tsConfigJson = getTsConfigJson(appSrc);
  if (tsConfigJson) {
    targetAlias = getTsConfigAlias(devInfo, tsConfigJson);
  }
  return targetAlias;
}

function inferConfAlias(devInfo, options) {
  const { appSrc, appConf, pkgName } = options;
  // const alias = appConf?.alias;
  // 考虑兼容性，不用可选链
  const alias = (appConf || {}).alias || '';
  const tipLabel = `package ${pkgName}`;
  const tsConfigAlias = getTsConfigAliasByAppSrc(devInfo, appSrc);

  if (alias && !tsConfigAlias) {
    throw new Error(`${tipLabel} has alias ${alias} in dev-info, but has no alias in its tsconfig.json`);
  }

  if (alias && alias !== tsConfigAlias) {
    throw new Error(`${tipLabel}'s alias ${alias} in dev-info is not equal alias ${tsConfigAlias} in tsconfig.json`);
  }

  return alias || tsConfigAlias;
}

function getPrefixedDirName(appSrc) {
  const strList = appSrc.split('/');
  const len = strList.length;
  return `${strList[len - 3]}/${strList[len - 2]}`;
}

/**
 * 通过src完整路径获得应用在大仓里的所属目录
 * @example
 * ```
 * input: /user/path/to/hel-mono/packages/mono-comps-in-one-v2/src
 * output: packages
 * ```
 */
function getAppBelongTo(appSrc) {
  const strList = appSrc.split('/');
  return strList[strList.length - 3];
}

/**
 * 获得 alias 描述对象
 */
function buildAppAlias(appSrc, /** @type {IDevInfo} */ devInfo, prefixedDir2Pkg) {
  // 支持宿主和其他子模块 @/**/*, @xx/**/* 等能够正常工作
  const appAlias = {};
  const prefixedDirName = getPrefixedDirName(appSrc);
  const packName = prefixedDir2Pkg[prefixedDirName];
  const targetAlias = inferConfAlias(devInfo, { appSrc, appConf: devInfo.appConfs[packName], packName });
  if (targetAlias) {
    appAlias[targetAlias] = appSrc;
  }

  return appAlias;
}

function getAppDirPath(appSrc) {
  const prefixedDir = getPrefixedDirName(appSrc);
  const { monoRoot } = getMonoRootInfo();
  return path.join(monoRoot, prefixedDir);
}

function getAppCwd(appSrc) {
  let appCwd = appSrc;
  if (appCwd.endsWith('/src')) {
    appCwd = appSrc.substring(0, appSrc.length - 4);
  }
  return appCwd;
}

module.exports = {
  inferConfAlias,
  buildAppAlias,
  getAppCwd,
  getAppBelongTo,
  getTsConfigJson,
  getTsConfigAliasByAppSrc,
  getPrefixedDirName,
  getAppDirPath,
};
