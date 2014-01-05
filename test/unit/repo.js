var Repository = require('../../lib/Repository.js');

QUnit.module('Repository');

test('Basic get and set', function() {

  var repo = new Repository();

  var key = 'k';
  var val = {};

  repo.set(key, val);
  strictEqual(repo.get(key), val, 'basic set / get');
  strictEqual(repo.get('bad'), undefined, 'bad get');
  strictEqual(repo.has(key), true, 'has');
  strictEqual(repo.has('bad'), false, 'has not');

});

test('Nested get and set and has', function() {

  var repo = new Repository();
  var key = 'a.b.c';
  var val = 'z';

  repo.set(key, val);
  strictEqual(repo.get(key), val, 'basic set / get');
  deepEqual(repo.get('a'), { b: { c: 'z' } }, 'nested');
  repo.set('a.b.d', 'y');
  deepEqual(repo.get('a'), { b: { c: 'z', d: 'y' } }, 'nested');
  strictEqual(repo.has('a'), true);
  strictEqual(repo.has('a.b'), true);
  strictEqual(repo.has('a.b.c'), true);
  strictEqual(repo.has('x'), false);
  strictEqual(repo.has('a.b.nope'), false);

  repo.set('something', { x: { y: { z: 'baller' }}});
  strictEqual(repo.get('something.x.y.z'), 'baller', 'dot notty');

});

test('Merge', function() {

  var repo = new Repository();

  repo.set('a.b.c', 'd');
  repo.set({ a: {b: { z: 'y' }}});
  deepEqual(repo._repo, { a: {b: { c: 'd', z: 'y' }}}, 'yah');

});
