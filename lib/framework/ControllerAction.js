module.exports = ControllerAction;

/**
 * An action representing the execution of a method on a controller.
 * @param {Function} T Controller constructor function.
 * @param {String} methodName Name of the method to route to.
 * @constructor
 */
function ControllerAction(T, methodName)
{
  this.T = T;
  this.methodName = methodName;
}



