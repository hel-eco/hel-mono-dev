export function getWindow() {
  if (window) {
    return window;
  }
  return { location: { search: '', origin: '', port: '' } } as unknown as Window & typeof globalThis;
}

export function getIsTestEnv() {
  const windowVar = getWindow();
  const { origin, port } = windowVar.location;
  const isTestEnv = origin === 'https://m2.news.qq.com' || !!port;
  return isTestEnv;
}
