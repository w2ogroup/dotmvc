var Config    = require('../../lib/facades/Config.js');
var Route     = require('../../lib/facades/Route.js');
var Framework = require('../../lib/Framework.js');

QUnit.module('Framework');

test('Basic closure routing', function() {

  new Framework().start();

  Route.get('/', function() {
    return 'Hello, World!';
  });

  strictEqual(Route.dispatch(''), 'Hello, World!');

});

test('Basic controller', function() {


  // Controller
  var TestController = function ()
  {

  };

  TestController.prototype.indexAction = function()
  {
    return 'Hello, World!';
  };

  // Boot
  var app = new Framework();
  app.start();
  Route.controller('test', TestController);

  strictEqual(Route.dispatch('test'), 'Hello, World!');

});

