var ControllerManager = require('../framework/ControllerManager.js');
var __mixin           = require('../util/mixin.js');
var Facade            = require('../Facade.js');

module.exports = Route;
__mixin(Route, Facade);

/**
 * @constructor
 * @extends Facade
 */
function Route()
{

}

Route.get = function(pattern, action)
{
  return this.getInstance().createRoute(pattern, action);
};

/**
 * Add a controller and setup routes for all actions we've got.
 * @param {String} prefix Route prefix we want to trigger this controller.
 * @param {Function} TController Constructor function for the controller we
 * want to register.
 */
Route.controller = function(prefix, TController)
{
  /** @type {ControllerManager} */
  var controllers = this.resolver.make('controllers');
  return controllers.registerController(prefix, TController);
};

Route.getFacadeAccessor = function() { return 'router'; };



