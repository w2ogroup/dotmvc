var __interface = require('../../lib/util/interface.js');

QUnit.module('Interface');

test('check()', function() {

  function Thing() {}
  Thing.prototype.f = function() {};
  var IThing = __interface.define(Thing);

  function Thing2() {}
  Thing2.prototype.g = function() {};
  var IThing2 = __interface.define(Thing2);

  function T() {}
  T.prototype.f = function() {};

  strictEqual(__interface.check(T, IThing), true, 'implements');
  strictEqual(__interface.check(T, IThing2), false, 'does not implement');

});
