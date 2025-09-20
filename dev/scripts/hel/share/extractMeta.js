const path = require('path');
const { extractHelMetaJson } = require('hel-dev-utils');
const { getMonoDevData, cst, monoUtil } = require('hel-mono-helper');
const { setDeployHost } = require('./setDeployHost');

exports.extractMeta = function (isInAppMetaMode) {
  setDeployHost();
  let buildDir = '';
  const appData = monoUtil.getCWDAppData();
  // 未传递的话则自动推导
  if (isInAppMetaMode === undefined) {
    buildDir = monoUtil.getBuildDir();
  } else {
    buildDir = isInAppMetaMode ? cst.HEL_DIST_EX : cst.HEL_DIST;
  }

  const buildDirFullPath = path.join(appData.appDirPath, `./${buildDir}`);
  // 这里设置 HEL_BUILD 是为了让如下命令的 HEL_APP_HOME_PAGE 可生效
  // HEL_APP_HOME_PAGE='http://gogo.com' pnpm run build:meta
  process.env.HEL_BUILD = cst.HEL_MICRO_BUILD;
  // 这个文件是后台模块默认入口
  const isMainJs = webPath => webPath.endsWith('/srv/index.js');
  const { appInfo, appPkgJson } = getMonoDevData();

  extractHelMetaJson({
    appInfo,
    enableAssetInnerText: true,
    buildDirFullPath,
    packageJson: appPkgJson,
    // 约定了 srv 目录存放服务端模块产物
    matchSrvModFile: fileDesc => fileDesc.fileWebPath.includes('/srv/'),
    matchSrvModFileIndex: fileDesc => isMainJs(fileDesc.fileWebPath),
    matchIncludedFile: (fileDesc) => {
      const { fileWebPath } = fileDesc;
      // srv 目录下的文件，非 .d.ts 的都可以记录到元数据里
      if (fileWebPath.includes('/srv/')) {
        return !fileWebPath.endsWith('.d.ts');
      }
      return true;
    },
  }).catch((err) => {
    console.error(err);
    if (err.message.includes('no such file') && err.message.includes('/hel_dist')) {
      const cmd = buildDir === cst.HEL_DIST ? 'build:hel' : 'build:helex';
      console.log('+-------------------------Hel-mono hint----------------------------------------');
      console.error(`| If this error caused by npm run build:meta, you may run ${cmd} first.`);
      console.error(`| Or just run ${cmd}m directly to see hel-meta.json`);
      console.log('+------------------------------------------------------------------------------');
    }
    process.exit(-1);
  });
}
