var _ = require('underscore');

module.exports = CommandProvider;

// Mixin that gives an object the ability to handle commands when bound to a
// view object
function CommandProvider()
{

}

// Static function that can be used to request a command from an object.
// Returns true if the command is handled and false if it isnt handled (either
// it doesn't have the command or it doesnt handle any commands
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

// Command class.
CommandProvider.Command = function(from, commandName, parameter)
{
  if (!from) throw 'Command needs from parameter';
  if (!commandName) throw 'Command needs command name';

  this.id        = _.uniqueId();
  this.name      = commandName;
  this.from      = from;
  this.parameter = parameter || null;
  this.response  = null;
};

CommandProvider.Command.prototype.toString = function()
{
  return '[Command ' + this.id + ':' + this.name + ']';
};
