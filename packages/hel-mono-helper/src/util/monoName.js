/** @typedef {import('../types').IMonoDevInfo} IDevInfo */
const fs = require('fs');
const path = require('path');
const { cst } = require('hel-dev-utils');
const { safeGet } = require('./dict');
const { getTsConfigAliasByAppSrc } = require('./appSrc');
const { getAliasData } = require('./alias');
const { intersection, getFileJson, getDevInfoDirs } = require('./base');
const { INNER_SUB_MOD_ORG, INNER_APP_ORG } = require('../consts');
const { getMonoRootInfo } = require('./rootInfo');
const { getMonoDirOrFilePath, getUnderDirSubPath } = require('./monoPath');
const { getLocaleTime } = require('./time');

/**
 * 获取大仓某个一级目录下的目录与应用、应用与目录映射关系
 */
function getMonoLevel1NameMap(level1DirName) {
  const levelDirPath = getMonoDirOrFilePath(level1DirName);
  let fsDirNames = [];
  if (fs.existsSync(levelDirPath)) {
    fsDirNames = fs.readdirSync(levelDirPath);
  }

  const pkgName2DirName = {};
  const pkgName2Deps = {};
  const dirName2PkgName = {};
  const packNames = [];
  const dirNames = [];

  for (const dirName of fsDirNames) {
    const path = getUnderDirSubPath(levelDirPath, dirName);
    const stat = fs.statSync(path);
    if (!stat.isDirectory()) {
      continue;
    }
    const filepath = getUnderDirSubPath(path, 'package.json');
    if (!fs.existsSync(filepath)) {
      continue;
    }

    const { name, dependencies } = getFileJson(filepath);
    if (pkgName2DirName[name]) {
      throw new Error(`package name ${name} duplicated under ${level1DirName} dir`);
    }

    pkgName2DirName[name] = dirName;
    pkgName2Deps[name] = dependencies || {};
    dirName2PkgName[dirName] = name;
    packNames.push(name);
    dirNames.push(dirName);
  }

  return { pkgName2DirName, pkgName2Deps, dirName2PkgName, packNames, dirNames };
}

/**
 * 获取整个大仓的目录与应用、应用与目录映射关系
 * @returns {import('../types').IMonoNameMap}
 */
function getMonoNameMap(/** @type {IDevInfo} */ devInfo) {
  const { appsDirs, subModDirs } = getDevInfoDirs(devInfo);
  const dupDirs = intersection(appsDirs, subModDirs);
  if (dupDirs.length > 0) {
    throw new Error(`found duplicated dir names between (${appsDirs.join(',')}) and (${subModDirs.join(',')})`);
  }

  const { monoRootHelDir, monoRoot } = getMonoRootInfo();
  const monoNameMap = {};
  const packNames = [];
  const dupPackNames = [];
  const pkg2Deps = {}; // 包名与 dependencies 对象映射
  const pkg2BelongTo = {}; // 包名与 belongTo 目录映射
  const pkg2Dir = {}; // 包名与项目目录映射
  const pkg2Info = {}; // 包名与info映射
  const pkg2AppDirPath = {}; // 包名与应用的目录路径映射
  const prefixedDir2Pkg = {}; // 带belongTo前缀的目录名与包名映射
  const dir2Pkgs = {}; // 目录名与包名list映射

  // mono-dep.json 需要的数据
  const depData = {};
  const depDataPure = {};
  const monoDep = { createdAt: getLocaleTime(), depData };
  const monoDepPure = { createdAt: getLocaleTime(), depData: depDataPure };

  const mapData = (belongTo, isSubMod = false) => {
    const nameMap = getMonoLevel1NameMap(belongTo);
    nameMap.packNames.forEach((name) => {
      if (!packNames.includes(name)) {
        packNames.push(name);
      } else {
        dupPackNames.push(name);
      }
    });
    monoNameMap[belongTo] = { isSubMod, nameMap };
    Object.assign(pkg2Deps, nameMap.pkgName2Deps);

    nameMap.packNames.forEach((pkgName) => {
      pkg2BelongTo[pkgName] = belongTo;
      const dirName = nameMap.pkgName2DirName[pkgName];
      const prefixedDir = `${belongTo}/${dirName}`;
      pkg2Dir[pkgName] = dirName;

      const appDirPath = path.join(monoRoot, `./${prefixedDir}`);
      pkg2AppDirPath[pkgName] = appDirPath;
      const appSrcPath = path.join(appDirPath, './src');
      const alias = getTsConfigAliasByAppSrc(devInfo, appSrcPath);
      prefixedDir2Pkg[`${belongTo}/${dirName}`] = pkgName;

      const pkgs = safeGet(dir2Pkgs, dirName, []);
      pkgs.push(pkgName);

      const proxyPkgName = isSubMod ? `${INNER_SUB_MOD_ORG}/${dirName}` : `${INNER_APP_ORG}/${dirName}`;
      const proxySrcPath = path.join(monoRootHelDir, `./${prefixedDir}/src`);
      const infoPure = { pkgName, belongTo, dirName, isSubMod, appSrcPath, alias };
      const info = { ...infoPure, proxyPkgName, proxySrcPath };
      const deps = pkg2Deps[pkgName];

      pkg2Info[pkgName] = info;
      depData[pkgName] = { ...info, appDirPath, prefixedDir, deps };
      depDataPure[pkgName] = { ...infoPure, appDirPath, prefixedDir, deps };
    });
  };

  appsDirs.forEach((dir) => mapData(dir));
  subModDirs.forEach((dir) => mapData(dir, true));

  if (dupPackNames.length > 0) {
    throw new Error(`these package names (${dupPackNames.join(',')}) duplicated`);
  }

  return {
    monoNameMap,
    pkg2AppDirPath,
    pkg2Deps,
    pkg2BelongTo,
    pkg2Dir,
    prefixedDir2Pkg,
    pkg2Info,
    dir2Pkgs,
    monoDep,
    monoDepPure,
  };
}

function getBuildDirPath(devInfo, pkgName, buildDir = cst.HEL_DIST_DIR) {
  const { pkg2AppDirPath } = getMonoNameMap(devInfo);
  const appDirPath = pkg2AppDirPath[pkgName];
  if (!appDirPath) {
    throw new Error(`no app dir found for ${pkgName}!`);
  }
  return path.join(appDirPath, `./${buildDir}`);
}

function getCmdDPNameData(/** @type {IDevInfo} */ devInfo, dirOrPkgName) {
  const { pkg2Dir, dir2Pkgs, prefixedDir2Pkg, pkg2BelongTo } = getMonoNameMap(devInfo);
  const dirName = pkg2Dir[dirOrPkgName];
  const pkgName = prefixedDir2Pkg[dirOrPkgName];
  const { pkg2Alias } = getAliasData(devInfo);
  const getAlias = (pkgName) => pkg2Alias[pkgName] || '';

  if (dirName) {
    const pkgName = dirOrPkgName;
    const belongTo = pkg2BelongTo[pkgName];
    return { pkgName, dirName, belongTo, prefixedDir: `${belongTo}/${dirName}`, alias: getAlias(pkgName) };
  }

  if (pkgName) {
    const prefixedDir = dirOrPkgName;
    const [belongTo, dirName] = prefixedDir.split('/');
    return { pkgName, dirName, belongTo, prefixedDir, alias: getAlias(pkgName) };
  }

  const pkgs = dir2Pkgs[dirOrPkgName] || [];
  if (pkgs.length === 1) {
    const pkgName = pkgs[0];
    const dirName = dirOrPkgName;
    const belongTo = pkg2BelongTo[pkgName];
    return { pkgName, dirName, belongTo, prefixedDir: `${belongTo}/${dirName}`, alias: getAlias(pkgName) };
  }

  if (pkgs.length > 1) {
    const tip =
      `multi packages have the same dir name ${dirOrPkgName}, ` + `you may operate it with a prefixed dir name like xxx/${dirOrPkgName}`;
    throw new Error(tip);
  }

  throw new Error(`${dirOrPkgName} is not a valid dir name or package name`);
}

module.exports = {
  getMonoNameMap,
  getBuildDirPath,
  getCmdDPNameData,
};
