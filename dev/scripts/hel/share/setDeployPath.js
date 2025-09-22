/**
 * ATTENTION:
 * 此文件仅用于修改 myHomePage 或 myCdnPath 来观察产物里 hel-meta.json 的数据格式，
 * 大多数时候你应该修改 hel-mono.json 里的 deployPath 值来调整你的部署位置，
 * 或执行构建命令时，携带 HEL_APP_HOME_PAGE 或 HEL_APP_CDN_PATH 环境变量
 * 形如：
 *  HEL_APP_HOME_PAGE=https://my-web/public/assets pnpm start hel-demo-lib1 build:nbm
 *  HEL_APP_CDN_PATH=https://mycdn.com pnpm start hel-demo-lib1 build:nbm
 */

/**
 * 建议配置 myCdnHost（生成的链接符合语义化版本规范），配置 myHomePage 则完全使用 myHomePage 值生成部署位置
 * 生成链接形如：{myCdnHost}/...{asset_path}
 */
const myHomePage = '';

/**
 * 默认 https://unpkg.com，可以设置为带子路径的 cdn 域名
 * 生成链接形如：{myCdnHost}/{pkg_name}@{version}/hel_dist/...{asset_path}
 */
const myCdnPath = '';

/**
 * 构建和提取 hel-meta.json 时，设置模块部署的 home page 值或 cdn host
 * 注：同时设置了 myHomePage 和 myCdnPath 时，myHomePage 优先级高于 myCdnPath
 */
function setDeployPath() {
  const { HEL_APP_HOME_PAGE, HEL_APP_CDN_PATH } = process.env;
  // 命令行携带了 HEL_APP_HOME_PAGE 时优先使用命令行的，形如：
  // HEL_APP_HOME_PAGE=https://my-web/public/assets pnpm start hel-demo-lib1 build:nbsm
  if (!HEL_APP_HOME_PAGE && myHomePage) {
    process.env.HEL_APP_HOME_PAGE = myHomePage;
  }
  // 命令行携带了 HEL_APP_CDN_PATH 时优先使用命令行的，形如：
  // HEL_APP_CDN_PATH=https://mycdn.com pnpm start hel-demo-lib1 build:nbsm
  if (!HEL_APP_CDN_PATH && myCdnPath) {
    process.env.HEL_APP_CDN_PATH = myCdnPath;
  }
}

module.exports = {
  setDeployPath,
};
