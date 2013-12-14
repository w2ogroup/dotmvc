var __mixin    = require('./util/mixin.js');
var Observable = require('./Observable.js');
var _          = require('underscore');

module.exports = Messanger;
__mixin(Messanger, Observable);

Messanger.MESSAGE = 'Messanger::_MESSAGE_TOKEN';

// Mixin to add the ability for an object to emit messages that are received by
// e.g., a View
function Messanger()
{

}

// Send a message in the "standard protocol" that can be handled by anybody
// listening for messages from this object
Messanger.prototype.sendMessage = function(hash)
{
  for (var name in hash) {
    var param = hash[name];

    var message = new Messanger.Message(this, name, param);
    this.trigger(Messanger.MESSAGE, message);
  }
};

// Message class. Enscapsulate a message that is to be sent out
Messanger.Message = function(from, messageName, param)
{
  if (!from) throw 'Messages needs from parameter';
  if (!messageName) throw 'Message needs message name';

  this.id      = _.uniqueId();
  this.from    = from;
  this.message = messageName;
  this.param   = param || null;

  this._preventOthers = false;
};

// Prevent the message from getting handled / propigated again. Useful for when
// a messanger is bound to multiple aggregators (views)
Messanger.Message.prototype.preventOthers = function()
{
  this._preventOthers = true;
};

Messanger.Message.prototype.toString = function()
{
  return '[Message ' + this.id + ']';
};

