// @mc/xxx/yy/utils/xxx
// @mc/utils --> ../xx/yy/uitls
// .a/b/uitls
// synctsconfig

/** @type {import('hel-mono-types').IMonoDevInfo} */
module.exports = {
  appConfs: {
    hub: {
      port: 3001,
    },
    hub2: {
      port: 3006,
    },
    'mono-comps-in-one-v2': {
      alias: '@mc',
      port: 3100,
      hel: {
        appGroupName: 'mono-comps',
        appNames: {
          test: 'mono-comps-test',
        },
      },
    },
    'hel-demo-lib1': {
      alias: '@h',
    },
  },
  appExternals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    'hel-micro': 'HelMicro',
    'hel-lib-proxy': 'HelLibProxy',
  },
  platform: 'unpkg',
};
