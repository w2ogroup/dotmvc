var Command = require('./Command.js');

module.exports = CommandProvider;

// Mixin that gives an object the ability to handle commands when bound to a
// view object
function CommandProvider()
{

}

/**
 * @param {CommandProvider} target Provider that may be able to execute
 * @param {Command} command Command to execute
 */
CommandProvider.attemptExecuteCommand = function(target, command)
{
  if (!target || !target._registeredCommands)
    return false;
  if (!(target._registeredCommands[command.name] instanceof Function))
    return false;

  command.response =
    target._registeredCommands[command.name](command.parameter);
  return true;
};

// Register a handler to get called when this object receives a command
CommandProvider.prototype.registerCommand = function(hash)
{
  // Ensure we've got the hidden things
  if (!this._registeredCommands) {
    Object.defineProperties(this, { _registeredCommands: {
      enumerable: false,
      configurable: true,
      writable: true,
      value: {}
    }});
  }

  var commands = this._registeredCommands;

  // Add all maps
  for (var command in hash) {
    var handler = hash[command];
    if (commands[command])
      throw 'Cannot registered multiple handlers for command "' +
        command + '"';
    if (!(handler instanceof Function))
      throw 'Command handler must be a function';
    commands[command] = handler.bind(this);
  }
};
