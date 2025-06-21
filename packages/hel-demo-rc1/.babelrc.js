module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
      },
    ],
    '@babel/react',
  ],
  plugins: [
    ["@babel/plugin-transform-class-properties", { "loose": true }]
  ]
};
