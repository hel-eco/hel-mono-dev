/** @typedef {import('../types').IMonoDevInfo} IDevInfo */
const fs = require('fs');
const path = require('path');
const { HEL_DIR_NAME, INNER_SUB_MOD_ORG, INNER_APP_ORG, APPS, PACKAGES } = require('../consts');
const { lastNItem } = require('./arr');

/**
 * 获取 node 命令执行时所处目录，
 * 形如：/your/path/hel-mono/apps/hub
 */
exports.getCWD = function () {
  // why realpathSync
  // @see https://github.com/facebook/create-react-app/pull/648
  return fs.realpathSync(process.cwd());
};

exports.getCWDPkgDir = function () {
  const cwd = exports.getCWD();
  const strList = cwd.split(path.sep);
  return strList[strList.length - 1];
};

exports.getCWDPkgPrefixedDir = function () {
  const cwd = exports.getCWD();
  const strList = cwd.split(path.sep);
  return `${lastNItem(strList, 2)}/${lastNItem(strList, 1)}`;
};

exports.getCWDIsForRootHelDir = function () {
  const cwd = exports.getCWD();
  const strList = cwd.split(path.sep);
  const rootHelAppSeg = `${path.sep}${HEL_DIR_NAME}${path.sep}${INNER_APP_ORG}`;
  const rootHelSubModSeg = `${path.sep}${HEL_DIR_NAME}${path.sep}${INNER_SUB_MOD_ORG}`;
  return strList.includes(rootHelAppSeg) || strList.includes(rootHelSubModSeg);
};

/**
 * 读取文件 json 对象
 */
exports.getFileJson = function (standardJsonFilePath, allowNull) {
  try {
    const str = fs.readFileSync(standardJsonFilePath, { encoding: 'utf-8' });
    const json = JSON.parse(str);
    return json;
  } catch (err) {
    if (!allowNull) {
      throw err;
    }
    return null;
  }
};

exports.getDirName = function (appSrc) {
  const strList = appSrc.split(path.sep);
  return strList[strList.length - 2];
};

exports.getBelongTo = function (appSrc) {
  const strList = appSrc.split(path.sep);
  return strList[strList.length - 3];
};

/** 求两个数组的交集 */
exports.intersection = function (arr1, arr2) {
  return arr1.reduce((result, current) => {
    if (arr2.includes(current) && !result.includes(current)) {
      result.push(current);
    }
    return result;
  }, []);
};

exports.ensureSlash = function (inputPath, needsSlash) {
  const hasSlash = inputPath.endsWith('/');
  if (hasSlash && !needsSlash) {
    return inputPath.substr(0, inputPath.length - 1);
  }
  if (!hasSlash && needsSlash) {
    return `${inputPath}/`;
  }
  return inputPath;
};

exports.getDevInfoDirs = function getDevInfoDirs(/** @type {IDevInfo} */ devInfo) {
  const { appsDirs = [APPS], subModDirs = [PACKAGES] } = devInfo;
  const belongToDirs = appsDirs.concat(subModDirs);
  return { appsDirs, subModDirs, belongToDirs };
};

exports.noop = function () {};
