var __mixin    = require('./util/mixin.js');
var Observable = require('./Observable.js');
var _          = require('underscore');

module.exports = Messanger;
__mixin(Messanger, Observable);

Messanger.MESSAGE = 'Messanger::_MESSAGE_TOKEN';

function Messanger()
{

}

/**
 * Attempt to let an object receive a message. Returns true if the message is
 * received and false if it isnt (either it doesnt have messaging abilities or
 * is not listening for this message)
 */
Messanger.prototype.attemptReceiveMessage = function(target, message)
{
  if (!target || !target._registeredMessages)
    return false;

  var handler = target._registeredMessages[message.name];
  if (!(handler instanceof Function))
    return false;

  message.response = handler(message.parameter);
  return true;
};

/**
 * Send messages with a parameter.
 */
Messanger.prototype.sendMessage = function(hash)
{
  for (var name in hash) {
    var param = hash[name];

    var message = new Messanger.Message(this, name, param);
    this.trigger(Messanger.MESSAGE, message);
  }
};

/**
 * Message class. Enscapsulate a message that is to be sent out.
 */
Messanger.Message = function(from, messageName, parameter)
{
  if (!from) throw 'Messages needs from parameter';
  if (!messageName) throw 'Message needs message name';

  this.id        = _.uniqueId();
  this.name      = messageName;
  this.from      = from;
  this.parameter = parameter || null;

  this._preventOthers = false;
};

/**
 * Prevent the message from getting handled / propigated again. Useful for when
 * a messanger is bound to multiple aggregators (views)
 */
Messanger.Message.prototype.preventOthers = function()
{
  this._preventOthers = true;
};

Messanger.Message.prototype.toString = function()
{
  return '[Message ' + this.id + ':' + this.name + ']';
};

