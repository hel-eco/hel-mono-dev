// [Hel]
const devInfo = require('dev-info');
const { getMonoDevData } = require('../../mono-helper');
const rootDir = process.cwd(); // app 目录路径
const appSrc = `${rootDir}/src`;

const { jestAlias } = getMonoDevData(devInfo, appSrc);

const jestConfig = {
  roots: [
    appSrc,
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
  setupFiles: [
    'react-app-polyfill/jsdom',
  ],
  setupFilesAfterEnv: [
    `${rootDir}/src/setupTests.ts`,
  ],
  testMatch: [
    `${rootDir}/src/**/__tests__/**/*.{js,jsx,ts,tsx}`,
    `${rootDir}/src/**/*.{spec,test}.{js,jsx,ts,tsx}`,
  ],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': `${rootDir}/../../dev/config/jest/babelTransform.js`,
    '^.+\\.css$': `${rootDir}/../../dev/config/jest/cssTransform.js`,
    '^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|css|json)$)': `${rootDir}/../../dev/config/jest/fileTransform.js`,
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  modulePaths: [],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    ...jestAlias,
  },
  moduleFileExtensions: [
    'web.js',
    'js',
    'web.ts',
    'ts',
    'web.tsx',
    'tsx',
    'json',
    'web.jsx',
    'jsx',
    'node',
  ],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  resetMocks: true,
};

const { testMatch } = process.env;
if (testMatch) {
  console.log('------ found cutomized testMatch, start compute ------');
  let prefixedTestMatch = testMatch;
  if (!testMatch.startsWith('<rootDir>')) {
    prefixedTestMatch = `${rootDir}/src/**${testMatch.startsWith('/') ? testMatch : `/${testMatch}`}`;
  }
  jestConfig.testMatch = [prefixedTestMatch];
  console.log(`computed testMatch: ${JSON.stringify(jestConfig.testMatch)}`);

  if (testMatch.includes('__tests__')) {
    // from: 'src/components/SomeComponent/__tests__/*.{ts,tsx}'
    // to: ['src/components/SomeComponent/', '*.{ts,tsx}']
    const [dirPath, filePath] = testMatch.split('__tests__/');
    // 只收集这一部分覆盖率，方便本地缩小查看范围
    jestConfig.collectCoverageFrom = [`${dirPath}**/${filePath}`];
    console.log(`computed collectCoverageFrom: ${JSON.stringify(jestConfig.collectCoverageFrom)}`);
  }
} else {
  console.log('开始载入jest配置文件，如果是本地执行，想缩小单测范围，可加上testMatch前缀执行，形如');
  // 执行类似命令，缩小测试范围
  // testMatch='*.test.{ts,tsx}' pnpm --filter hub run test
  console.log('testMatch=\'pages/__tests__/*.{ts,tsx}\' npm run test');
}

module.exports = jestConfig;
