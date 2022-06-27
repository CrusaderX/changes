const main = require('./src/main');
const input = require('./src/input');

(async () => {
  await main(input);
  process.exit(0);
})();