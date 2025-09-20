
/**
 * 建议配置 myCdnHost（生成的链接符合语义化版本规范），配置 myHomePage 则完全使用 myHomePage 值生成部署位置
 * 生成链接形如：{myCdnHost}/...{asset_path}
 */
const myHomePage = '';

/**
 * 默认 https://unpkg.com
 * 生成链接形如：{myCdnHost}/{pkg_name}@{version}/hel_dist/...{asset_path}
 */
const myCdnHost = '';

/**
 * 构建和提取 hel-meta.json 时，设置模块部署的 home page 值或 cdn host
 * 注：同时设置了 myHomePage 和 myCdnHost 时，myHomePage 优先级高于 myCdnHost
 */
function setDeployHost() {
  const { HEL_APP_HOME_PAGE, HEL_APP_CDN_HOST } = process.env;
  // 命令行携带了 HEL_APP_HOME_PAGE 时优先使用命令行的，形如：
  // HEL_APP_HOME_PAGE=https://my-web/public/assets pnpm start hel-demo-lib1 build:nbsm
  if (!HEL_APP_HOME_PAGE && myHomePage) {
    process.env.HEL_APP_HOME_PAGE = myHomePage;
  }
  // 命令行携带了 HEL_APP_CDN_HOST 时优先使用命令行的，形如：
  // HEL_APP_CDN_HOST=https://mycdn.com pnpm start hel-demo-lib1 build:nbsm
  if (!HEL_APP_CDN_HOST && myCdnHost) {
    process.env.HEL_APP_CDN_HOST = myCdnHost;
  }
}

module.exports = {
  setDeployHost,
};

