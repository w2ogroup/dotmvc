var Framework = require('../../lib/Framework.js');

QUnit.module('Framework');

test('Basic closure routing', function() {

  var app = new Framework();

  app.route('/', function() {
    return 'Hello, World!';
  });

  strictEqual(app.getRouter().dispatch('/'), 'Hello, World!', 'Hello, World!');

});

test('Controller routing', function() {

  // Boot
  var app = new Framework();

  // Dependency
  function Greeter() { }

  Greeter.prototype.greet = function(name)
  {
    return 'Hello, ' + name + '!';
  };

  // Controller
  function TestController(greeter)
  {
    this.greeter = greeter;
  }

  TestController.prototype.helloAction = function(name)
  {
    return this.greeter.greet(name);
  };

  // Root config
  app.controller(TestController);
  app.register('greeter', Greeter);

  // Test
  var resp = app.getRouter().dispatch('test/hello/Brandon');
  strictEqual(resp, 'Hello, Brandon!', 'got em');






});

