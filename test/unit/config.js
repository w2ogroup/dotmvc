var Config = require('../../lib/Config.js');

QUnit.module('Config');

test('Basic get and set', function() {

  var config = new Config();

  var key = 'k';
  var val = {};

  config.set(key, val);
  strictEqual(config.get(key), val, 'basic set / get');
  strictEqual(config.get('bad'), undefined, 'bad get');
  strictEqual(config.has(key), true, 'has');
  strictEqual(config.has('bad'), false, 'has not');

});

test('Nested get and set and has', function() {

  var config = new Config();
  var key = 'a.b.c';
  var val = 'z';

  config.set(key, val);
  strictEqual(config.get(key), val, 'basic set / get');
  deepEqual(config.get('a'), { b: { c: 'z' } }, 'nested');
  config.set('a.b.d', 'y');
  deepEqual(config.get('a'), { b: { c: 'z', d: 'y' } }, 'nested');
  strictEqual(config.has('a'), true);
  strictEqual(config.has('a.b'), true);
  strictEqual(config.has('a.b.c'), true);
  strictEqual(config.has('x'), false);
  strictEqual(config.has('a.b.nope'), false);

  config.set('something', { x: { y: { z: 'baller' }}});
  strictEqual(config.get('something.x.y.z'), 'baller', 'dot notty');

});

test('Merge', function() {

  var config = new Config();

  config.set('a.b.c', 'd');
  config.set({ a: {b: { z: 'y' }}});
  deepEqual(config._config, { a: {b: { c: 'd', z: 'y' }}}, 'yah');

});
