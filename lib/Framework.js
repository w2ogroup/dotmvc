var Resolver          = require('./Resolver.js');
var ControllerManager = require('./framework/ControllerManager.js');
var Repository        = require('./Repository.js');
var Router            = require('./Router.js');
var Config            = require('./facades/Config.js');
var Route             = require('./facades/Route.js');


module.exports = Framework;

/**
 * Facade class that is used to manage the application.
 * @constructor
 */
function Framework()
{
  this.resolver = new Resolver();

  // Create an IoC-aware controller manager
  this.resolver.singleton('controllers', function (resolver) { 
    return new ControllerManager(resolver); 
  });
}

/**
 * Start the application.
 */
Framework.prototype.start = function()
{
  this.setupFacade(Config, Repository);
  this.setupFacade(Route, Router);
};

/**
 * Create shared dependencies by default for facades if they don't already have
 * them.
 * @param {Facade} F
 * @param {Function} T
 */
Framework.prototype.setupFacade = function(F, T)
{
  F.resolver = this.resolver;
  var name = F.getFacadeAccessor();
  if (!this.resolver.isRegistered(name))
    this.resolver.register(name, T, true);
  F.map();
};



