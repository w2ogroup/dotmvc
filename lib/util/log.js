// Centralized logging, in case we need to switch it up

module.exports = log;

// Fix up console methods in IE
if (Function.prototype.bind &&
  window.console &&
  typeof console.log === 'object') {
  ['log', 'warn'].forEach(function(method) {
      console[method] = this.bind(console[method], console);
    }, Function.prototype.call);
}

function log()
{
  return console.log.apply(console, arguments);
}

log.warn = function()
{
  return console.warn.apply(console, arguments);
};

