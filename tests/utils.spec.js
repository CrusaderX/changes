const utils = require('../src/utils');

describe('utils', () => {
  it('getInputList ', function() {
    expect(utils.getInputList('')).toStrictEqual([]);
  });
});