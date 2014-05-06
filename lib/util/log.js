// Centralized logging, in case we need to switch it up

module.exports = log;

var SUPPORTED = true;

if (Function.prototype.bind &&
  window.console &&
  typeof console.log === 'object') {
  SUPPORTED = false;
}

function log()
{
  if (SUPPORTED)
    return console.log.apply(console, arguments);
}

log.warn = function()
{
  if (SUPPORTED)
    return console.warn.apply(console, arguments);
};

