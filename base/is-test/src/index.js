function getWindow() {
  if (window) {
    return window;
  }
  return { location: { search: '', origin: '', port: '' } };
}

/**
 * 是否是测试环境，用户可定制此函数
 * @type {(appGroupName:string)=> boolean}
 */
function getIsTest() {
  const windowVar = getWindow();
  const { origin, port } = windowVar.location;
  const isTestEnv = origin === 'https://xx.com' || !!port;
  return isTestEnv;
}

module.exports = getIsTest;
