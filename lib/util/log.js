// Centralized logging, in case we need to switch it up

module.exports = log;

function log()
{
  return console.log.apply(console, arguments);
}

log.warn = function()
{
  return console.warn.apply(console, arguments);
};

