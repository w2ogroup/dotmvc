var Config    = require('../../lib/facades/Config.js');
var Route     = require('../../lib/facades/Route.js');
var App       = require('../../lib/facades/App.js');
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

  // Dependency
  function Greeter()
  {
    this.greeting = Config.get('greeting');
  }

  Greeter.prototype.greet = function(name)
  {
    return this.greeting + ', ' + name + '!';
  };

  // Controller
  var TestController = function (greeter)
  {
    this.greeter = greeter;
  };

  TestController.prototype.helloAction = function(_name)
  {
    return this.greeter.greet(_name || 'World');
  };

  // Startup
  new Framework().start();
  Route.controller('test', TestController);
  App.register('greeter', Greeter);
  Config.set('greeting', 'Hello');

  // Test
  strictEqual(Route.dispatch('test/hello/Brandon'), 'Hello, Brandon!');

});

