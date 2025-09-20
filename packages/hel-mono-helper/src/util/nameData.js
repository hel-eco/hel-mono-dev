/** @typedef {import('../types').IMonoDevInfo} IDevInfo */
const { getMonoNameMap } = require('./monoName');
const { checkPkgsLenNotGT1 } = require('./err');

/**
 * keywordName 可以是带父目录名的目录名，目录名，包名，格式形如：apps/hub, hub, @xxx/hub
 * @return {import('../types').INameData}
 */
exports.getNameData = function (/** @type string */ mayPkgOrDir, /** @type {IDevInfo} */ devInfo) {
  const { monoNameMap, dir2Pkgs } = getMonoNameMap(devInfo);

  if (!mayPkgOrDir.startsWith('@') && mayPkgOrDir.includes('/')) {
    const [belongToDir, appDir] = mayPkgOrDir.split('/');
    const dirMonoMap = monoNameMap[belongToDir];
    if (!dirMonoMap) {
      throw new Error(`found no dir ${belongToDir} under hel-mono project`);
    }

    const { nameMap, isSubMod } = dirMonoMap;
    const { dirName2PkgName } = nameMap;
    const pkgName = dirName2PkgName[appDir];
    if (!pkgName) {
      throw new Error(`found no project for ${belongToDir}/${appDir}`);
    }

    return { pkgName, dirName: appDir, isSubMod, belongTo: belongToDir };
  }

  const dirs = Object.keys(monoNameMap);
  let result = null;
  for (let i = 0; i < dirs.length; i++) {
    const belongToDir = dirs[i];
    const { nameMap, isSubMod } = monoNameMap[belongToDir];
    const { dirName2PkgName, pkgName2DirName } = nameMap;

    // 把关键字优先作为包名处理
    const dirName = pkgName2DirName[mayPkgOrDir];
    if (dirName) {
      result = { pkgName: mayPkgOrDir, dirName, isSubMod, belongTo: belongToDir };
      break;
    }

    const pkgName = dirName2PkgName[mayPkgOrDir];
    if (pkgName) {
      const pkgs = dir2Pkgs[mayPkgOrDir];
      checkPkgsLenNotGT1(pkgs, mayPkgOrDir);
      result = { pkgName, dirName: mayPkgOrDir, isSubMod, belongTo: belongToDir };
      break;
    }
  }

  // OPTIMIZE !result 时尝试查找 .hel 下的项目，支持 npm start @hel-packages/mono-comps-in-one-v2 来显式启动代理项目
  if (!result) {
    msg =
      `module ${mayPkgOrDir} is not under these dirs (${dirs.join(',')}),`
      + ` you may execute "pnpm start .create ${mayPkgOrDir}" to create it`;
    throw new Error(msg);
  }

  return result;
};
