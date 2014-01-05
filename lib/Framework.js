var Resolver          = require('./Resolver.js');
var ControllerManager = require('./framework/ControllerManager.js');
var Repository        = require('./Repository.js');
var Router            = require('./Router.js');
var Config            = require('./facades/Config.js');
var Route             = require('./facades/Route.js');
var App               = require('./facades/App.js');

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
 * @return {Framework}
 */
Framework.prototype.start = function()
{
  var resolver = this.resolver;
  this.setupFacade(App, function() { return resolver; });

  this.setupFacade(Config, Repository);
  this.setupFacade(Route, Router);

  Config.set('environment.inBrowser', this.isInBrowser());

  return this;
};

Framework.prototype.isInBrowser = function()
{
  return !!process.browser;
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



