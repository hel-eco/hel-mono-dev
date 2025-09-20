const { fns } = require('./fns');

module.exports = function startFor() {
  // ['/xx/bin/node', '/xx/hel/startFor', ...]
  const argv = process.argv;
  const restArgs = argv.slice(2);
  console.log(argv);
  const [keyword] = restArgs;

  const fn = fns[keyword];
  if (!fn) {
    throw new Error(`No implement handler for ${keyword}`);
  }

  fn();
}
