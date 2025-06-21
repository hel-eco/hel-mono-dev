const path = require('path');
const { extractHelMetaJson, cst } = require('hel-dev-utils');
const devInfo = require('dev-info');
const { getMonoDevData } = require('../../../dev/mono-helper');

// 这个文件是后台模块默认入口
const isMainJs = webPath => webPath.endsWith('/srv/index.js');
const { appInfo, appPkgJson } = getMonoDevData(devInfo);

extractHelMetaJson({
  appInfo,
  enableAssetInnerText: true,
  buildDirFullPath: path.join(__dirname, `../${cst.HEL_DIST_DIR}`),
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
}).catch(err => {
  console.error(err);
  process.exit(-1);
});
