// Centralized logging, in case we need to switch it up

module.exports = function()
{
  return console.log.apply(console, arguments);
};

