var Framework = require('../../lib/Framework.js');

QUnit.module('Framework');

test('Basic closure routing', function() {

  // Boot
  var app = new Framework();

  // Route
  app.route('/', function() {
    return 'Hello, World!';
  });

  // Test
  strictEqual(app.getRouter().dispatch('/'), 'Hello, World!', 'Hello, World!');

});

test('Controller routing and config', function() {

  // Boot
  var app = new Framework();

  // Dependency, uses the config framework dep
  function Greeter(config)
  {
    this.greeting = config.get('greeting');
  }

  Greeter.prototype.greet = function(name)
  {
    return this.greeting + ', ' + name + '!';
  };

  // Controller, uses the greeter dep
  function TestController(greeter)
  {
    this.greeter = greeter;
  }

  // Exposes an action called 'hello' with single param
  TestController.prototype.helloAction = function(name)
  {
    return this.greeter.greet(name);
  };

  TestController.prototype.missingMethod = function()
  {
    return 'Not found';
  };

  // Root config
  app.config('greeting', 'Hello');
  app.controller(TestController);
  app.register('greeter', Greeter);

  // Test
  var resp = app.getRouter().dispatch('test/hello/Brandon');
  strictEqual(resp, 'Hello, Brandon!', 'got em');
  resp = app.getRouter().dispatch('test/nothing/here');
  strictEqual(resp, 'Not found', 'missing');

});

