var Observable = require('./Observable.js');
var __mixin    = require('./util/mixin.js');
var __extends  = require('./util/extends.js');
var _          = require('underscore');

module.exports = Signal;

/**
 * Messaging construct that gets thrown around in the DOM via jquery events and
 * could be handled by various parts of the application.
 * @constructor
 * @param {Object} from Originating object
 * @param {String} type Message type
 * @param {*=} param Optional additional information
 */
function Signal(from, type, param)
{
  if (!from || !type)
    throw new SignalInternalError(
      'Must provide both from and type paramters');

  /**
   * Unique identifier
   * @type {String}
   */
  this.id = _.uniqueId();

  /**
   * The originating object of this signal
   * @type {Object}
   */
  this.from = from;

  /**
   * The actual signal surface sender, should be injected when the signal is
   * sent (propagated).
   * @type {Object}
   */
  this.sentBy = null;

  /**
   * Injected when the signal has been handled
   * @type {Object}
   */
  this.receievedBy = null;

  /**
   * The specific signal type of this signal
   * @type {String}
   */
  this.type = type;


  /**
   * Any additional information packed into this signal
   * @type {*}
   */
  this.parameter = param || null;

  /**
   * When a signal is answered, its response goes here
   * @type {*}
   */
  this.response = Signal.NO_RESPONSE;
}

/**
 * Magic ref for when the signal hasn't been handled yet
 * @const
 */
Signal.NO_RESPONSE = {};

/**
 * For objects that lack the ability to physical send signals, the
 * functionality could be delegated to a listener (e,g, a ViewModel needs to be
 * able to send signals, which happens via the View).
 * @event
 */
Signal.SEND_SIGNAL = 'Signal#SEND_SIGNAL';

/**
 * Function that should be used if we're attempt to let an object handle a
 * signal. This ensures consistent handling semantics.
 * @param {Object} target Object that will attempt to handle the signal
 * @param {Signal} signal Signal we're trying to handle
 * @return {boolean} True if we handled this thing, false if we didn't
 */
Signal.attemptSignalHandle = function(target, signal)
{
  if (signal.response !== Signal.NO_RESPONSE)
    return false;
  if (!target)
    return false;

  var name = makeHandlerName(signal.type);
  if (!target[name] || !(target[name] instanceof Function))
    return false;

  signal.response    = target[name](signal.parameter);
  signal.receievedBy = target;
  return true;
};


/**
 * Give the object the ability to receive signals. Actually getting signals
 * sent to the objects is powered by a separate infrastructure.
 * @mixin
 */
Signal.SignalHandler = SignalHandler;
function SignalHandler()
{

}

/**
 * Setup a function to be called on this object when a signal is received.
 * Only a single handler can be used on each object.
 * @param {String} type Signal type to catch
 * @param {function(paramter:Object): Object} handler Callback to get fired
 */
Signal.SignalHandler.prototype.registerSignalHandler = function(type, handler)
{
  var name = makeHandlerName(type);
  if (this[name])
    throw new SignalInternalError(
      'Cannot have more than one handler for signal on a single object');

  // Drop a hidden prop on this piece
  Object.defineProperty(this, name, {
    enumerable: false,
    writable: false,
    configurable: true,
    value: handler.bind(this)
  });

};

/**
 * Give an object the ability to trigger a special event that represents the
 * request for a higher-level object to send a signal its behalf.
 * @mixin
 * @mixes Observable
 */
Signal.SignalSender = SignalSender;
__mixin(Signal.SignalSender, Observable);
function SignalSender()
{

}

/**
 * Fire an event that will request a signal be sent. Doesn't really "send a
 * signal" per se, but rather is the standard mechanism for alerting a listener
 * that we need to send a signal.
 * @param {String} type Message type
 * @param {*=} parameter Optional additional information
 */
Signal.SignalSender.prototype.sendSignal = function(type, paramter)
{
  var signal = new Signal(this, type, paramter);
  this.trigger(Signal.SEND_SIGNAL, signal);
};

function makeHandlerName(type)
{
  return '__signalHandler$' + type;
}

/**
 * Exception class for when something goes wrong inside of the signal. This
 * indicates a logical mistake during runtime.
 * @constructor
 */
Signal.SignalInternalError = SignalInternalError;
__extends(SignalInternalError, Error);
function SignalInternalError(message)
{
  SignalInternalError.Super.apply(this, arguments);
  this.message = message;
}

