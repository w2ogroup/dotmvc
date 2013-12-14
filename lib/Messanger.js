module.exports = Messanger;

Messanger.MESSAGE = 'Messanger::_MESSAGE_TOKEN';

function Messanger()
{

}

// Send a message in the "standard protocol" that can be handled by anybody
// listening for messages from this object
Messanger.prototype.sendMessage = function(hash)
{
  for (var message in hash) {
    var param = hash[message];
    this.trigger(Messanger.MESSAGE, {
      message: message,
      param: param,
      from: this
    });
  }
};


