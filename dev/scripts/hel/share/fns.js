const { executeStartDeps, cst, prepareHelEntry, monoUtil } = require('hel-mono-helper');
const { FN_TRIGGER_NAMES } = require('./consts');
const extractMeta = require('./extractMeta');
const { setDeployPath } = require('./setDeployPath');

function callCRAStart() {
  require('../../start');
}

function callCRABuild() {
  setDeployPath();
  require('../../build');
}

function startEX() {
  // 标识以 hel 模式启动应用，并自动启动对应的大仓里的hel子模块依赖
  // process.env.HEL_START = cst.HEL_START_WITH_LOCAL_RUNNING_DEPS;
  // process.env.HEL_BUILD = cst.HEL_EXTERNAL_BUILD;
  // prepareHelEntry({ forEX: true });
  // call cra start
  // require('../start');
  console.log('to be implement startEX');
}

function startAloneEXServer() {
  monoUtil.runAppScriptWithCWD(monoUtil.getCWDInfo().exCwd, 'start:hel');
}

function buildAloneEXServer() {
  monoUtil.runAppScriptWithCWD(monoUtil.getCWDInfo().exCwd, 'build:hel');
}

function buildAloneEXServerMeta() {
  monoUtil.runAppScriptWithCWD(monoUtil.getCWDInfo().exCwd, 'build:meta');
}

function buildInAppEXServerMeta() {
  extractMeta(true);
}

/** 启动对应的hel子模块服务 */
function startLocalDeps() {
  executeStartDeps();
}

/** 以 hel 模式启动应用，仅启动宿主，子模块需要用户主动调用 npm start .deps xx-hub */
function startAndWaitLocalDeps() {
  process.env.HEL_START = cst.HEL_START_AND_WAIT_LOCAL_DEPS;
  prepareHelEntry();
  callCRAStart();
}

/** 以 hel 模式启动应用，仅启动宿主，拉取对应的依赖 hel 子模块的远程已构建版本 */
function startWithRemoteDeps() {
  process.env.HEL_START = cst.HEL_START_WITH_REMOTE_DEPS;
  prepareHelEntry();
  callCRAStart();
}

function startMainAndLocalDeps() {
  process.env.HEL_START = cst.HEL_START_WITH_LOCAL_RUNNING_DEPS;
  prepareHelEntry();
  callCRAStart();
}

/** 以基于hel的传统整体模式启动  */
function startHelLegacyAllInOneMode() {
  process.env.HEL_BUILD = cst.HEL_ALL_BUILD;
  prepareHelEntry();
  callCRAStart();
}

/**
 * pnpm start <dir-or-pkg>:with raw
 * 以基于hel的传统整体模式启动
 */
function startRawLegacyAllInOneMode() {
  callCRAStart();
}

/**
 *  以 hel micro-module 微模块方式启动应用，同时自动启动对应 external 服务
 */
function startHelModUnderEXMode() {
  process.env.HEL_BUILD = cst.HEL_EXTERNAL_BUILD;
  // prepareHelEntry({ forEX: true });
  // call cra start
  // require('../start');
  console.log('to be implement', prepareHelEntry);
}

/**
 *  以 hel micro-module 微模块方式构建，此构建会自动排除掉所有一级依赖
 */
function buildHelModUnderEXMode() {
  console.log('to be implement');
}

/**
 * hel 微模块前端模块构建脚本，如有需要，可在流水线里构建后再提取相关产物推送到 helpack 或自己的模块管控平台
 */
function buildHelMod() {
  // 标识需要提取元数据给 helpack，构建产物会输出到 hel_dist 目录，以微模式构建
  process.env.HEL_BUILD = cst.HEL_MICRO_BUILD;
  prepareHelEntry();
  callCRABuild();
}

/**
 * 传统的基于hel的一体化构建方式脚本，如有需要，可在流水线里构建后再提取相关产物推送到 helpack 或自己的模块管控平台
 */
function buildHellModAll() {
  // 标识需要提取元数据给 helpack，构建产物会输出到 hel_dist 目录，以基于hel的传统整体模式构建
  process.env.HEL_BUILD = cst.HEL_ALL_BUILD;
  prepareHelEntry();
  callCRABuild();
}

/**
 * hel 微模块双端构建方式脚本，同时构建前端模块产物和后端模块产物，
 * 此脚本服务于子模块构建，如有需要，可在流水线里构建后再提取相关产物推送到 helpack 或自己的模块管控平台
 */
function buildHelBrowserAndServerMod() {
  // 标识需要提取元数据给 helpack，构建产物会输出到 hel_dist 目录，以微模块模式构建，会同时构建 hel 前后端（浏览器端、node端）模块
  process.env.HEL_BUILD = cst.HEL_MICRO_BUILD_BS;
  prepareHelEntry();
  callCRABuild();
}

const presetFns = {
  startAloneEXServer,
  buildAloneEXServer,
  buildAloneEXServerMeta,
  startHelModUnderEXMode,
  buildHelModUnderEXMode,
  buildInAppEXServerMeta,
  startLocalDeps,
  startAndWaitLocalDeps,
  startWithRemoteDeps,
  startMainAndLocalDeps,
  startHelLegacyAllInOneMode,
  startRawLegacyAllInOneMode,
  buildHelMod,
  buildHellModAll,
  buildHelBrowserAndServerMod,
};

/**
 * 用户可以多种方式命中（具体查看 FN_TRIGGER_NAMES 映射关系），例如以原始的整体模式方式启动应用
 * pnpm start <dir-or-pkg>:for raw
 * pnpm start <dir-or-pkg>:for startRawLegacyAllInOneMode
 */
const fns = {};
Object.keys(FN_TRIGGER_NAMES).forEach((key) => {
  const names = FN_TRIGGER_NAMES[key];
  const fn = presetFns[key];
  fns[key] = fn;
  names.forEach(v => fns[v] = fn);
})

module.exports = {
  fns,
  presetFns,
};
