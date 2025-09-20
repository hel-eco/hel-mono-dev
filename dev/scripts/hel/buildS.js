/**
 * keyword:【后端模块】
 * hel 微模块服务端模块构建方式脚本
 * 此脚本服务于子模块构建，流水线构建后会提取相关产物推送到 helpack
 */
const { buildSrvModToHelDist } = require('hel-mono-helper');

buildSrvModToHelDist();
