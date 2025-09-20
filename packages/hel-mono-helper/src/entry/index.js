/** @typedef {import('../types').IPrepareHelEntrysOptions} IPrepareHelEntrysOptions */
/** @typedef {import('../types').IMonoDevInfo} DevInfo */
const http = require('http');
const path = require('path');
const util = require('../util');
const { noDupPush } = require('../util/arr');
const { noop } = require('../util/base');
const cwdUtil = require('../util/cwd');
const exUtil = require('../util/ex');
const { getMonoAppDepDataImpl } = require('../util/depData');
const { genPnpmCmdAndRun } = require('../exec/cmd');
const { prepareHelEntryFiles, prepareHelAppEntry } = require('./prepare');
const { HEL_START_WITH_LOCAL_RUNNING_DEPS } = require('../consts');

const { helMonoLog } = util;

function visitDevServer(serverUrl, successCb, failCb) {
  const req = http.get(serverUrl, (res) => {
    let isSuccessCbCalled = false;
    res.on('data', () => {
      if (isSuccessCbCalled) {
        return;
      }

      isSuccessCbCalled = true;
      successCb();
    });
  });
  req.on('error', failCb);
}

/**
 * 为宿主和其子模块准备hel相关入口文件
 */
function prepareHelEntryForMainAndDeps(/** @type {IPrepareHelEntrysOptions} */ options) {
  const { isForRootHelDir, devInfo, nameData, startDeps, forEX } = options;
  const { belongTo, dirName } = nameData;
  const { monoRootHelDir, monoRoot } = util.getMonoRootInfo();
  const rootDir = isForRootHelDir ? monoRootHelDir : monoRoot;
  const targetCWD = path.join(rootDir, `./${belongTo}/${dirName}`);

  const appData = util.getCWDAppData(devInfo, targetCWD);
  const depData = getMonoAppDepDataImpl({ appSrc: appData.realAppSrcDirPath, devInfo, isAllDep: true, isForRootHelDir });
  const { depInfos } = depData;

  const shouldRunDeps = !util.isHelAllBuild() && !util.isHelExternalBuild();
  let startedPkgs = [];

  if (shouldRunDeps) {
    util.helMonoLog('depInfos', depInfos);
    // 为宿主的子模块依赖准备 hel 入口文件
    depInfos.forEach((info) => {
      const { belongTo, dirName, pkgName } = info;
      const targetCWD = path.join(rootDir, `./${belongTo}/${dirName}`);
      const appData = util.getCWDAppData(devInfo, targetCWD);
      const startHelDep = () => {
        helMonoLog(`starting hel dep ${pkgName}...`);
        // 生成类似命令并执行： pnpm --filter @hel-packages/some-sub run start
        genPnpmCmdAndRun(
          pkgName,
          { belongTo, dirName, scriptCmdKey: 'start:hel', isSubMod: appData.isSubMod },
          // 提供 callback，exec 变为异步模式
          (code, stdout, stderr) => {
            helMonoLog('Exit code:', code);
            helMonoLog('Program output:', stdout);
            helMonoLog('Program stderr:', stderr);
          },
        );
      };

      const injectedDevInfo = prepareHelEntryFiles({ devInfo, depData, appData });
      if (startDeps) {
        const { devHostname = injectedDevInfo.devHostname, port } = injectedDevInfo.mods[pkgName];
        const url = `${devHostname}:${port}`;
        visitDevServer(
          url,
          () => {
            helMonoLog(`${pkgName} dev-server is already running, hel-mono-helper will reuse it!`);
            noDupPush.noDupPush(startedPkgs, pkgName);
          },
          (e) => {
            helMonoLog(e.message);
            helMonoLog(`${pkgName} dev-server is not started! hel-mono-helper will start it...`);
            startHelDep();
          },
        );

        // while (startedPkgs.length !== depInfos.length) {
        //   console.log('wait');
        //   visitDevServer(url, () => {
        //     console.log('success');
        //     noDupPush(startedPkgs, pkgName);
        //   }, noop);
        // }
      }
    });
  }

  // 为宿主准备 hel 入口文件
  prepareHelEntryFiles({ devInfo, depData, appData, forEX });
}

function prepareHelEntry(/** @type {DevInfo} */ devInfo, pkgOrDir, forEX) {
  util.clearMonoLog();
  const pkgOrDirVar = pkgOrDir || util.getCWDPkgPrefixedDir();
  const isForRootHelDir = util.getCWDIsForRootHelDir();
  const nameData = util.getNameData(pkgOrDirVar, devInfo);

  const startDeps = process.env.HEL_START === HEL_START_WITH_LOCAL_RUNNING_DEPS;
  process.env.REACT_APP_HEL_START = process.env.HEL_START || '';
  prepareHelEntryForMainAndDeps({ isForRootHelDir, devInfo, nameData, startDeps, forEX });
}

/**
 * 为 ex 项目准备入口文件
 */
function prepareExProjHelEntry(/** @type {DevInfo} */ devInfo, exPrefixedDir) {
  util.clearMonoLog();
  const masterAppPrefixedDir = exUtil.getMasterAppPrefixedDir(exPrefixedDir);
  const masterAppCwd = cwdUtil.getCwdByPrefixedDir(masterAppPrefixedDir);
  const masterAppData = util.getCWDAppData(devInfo, masterAppCwd);

  const exAppCwd = cwdUtil.getCwdByPrefixedDir(exPrefixedDir);
  const exAppData = util.getCWDAppData(devInfo, exAppCwd);

  // 为了不混淆，appData 总是指向自身，新启用 masterAppData exAppData
  prepareHelAppEntry({ devInfo, appData: exAppData, masterAppData, exAppData, forEX: true });
}

module.exports = {
  prepareHelEntryForMainAndDeps,
  prepareHelEntry,
  prepareExProjHelEntry,
};
