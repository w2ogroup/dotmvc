var _ = require('underscore');

module.exports = Command;

/**
 * @param {Object} from The object that is executing the command
 * @param {string} commandName Stringly typed command name
 * @param {?} parameter Optional value to pass to command handler
 */
function Command(from, commandName, parameter)
{
  if (!from) throw 'Command needs from parameter';
  if (!commandName) throw 'Command needs command name';

  this.id        = _.uniqueId();
  this.name      = commandName;
  this.from      = from;
  this.parameter = parameter || null;
  this.response  = null;
}

Command.prototype.toString = function()
{
  return '[Command ' + this.id + ':' + this.name + ']';
};


