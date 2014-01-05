module.exports = getArgs;

/**
 * Get the parameter names of a function.
 * @param {Function} f A function.
 * @return {Array.<String>} An array of the argument names of a function.
 */
function getArgs(f)
{
  var ret = [];
  var args = f.toString().match(FUNCTION_ARGS);

  if (args) {
    args[1].replace(/[ ]*,[ ]*/, ',')
      .split(',')
      .map(function(s) { return s.trim(); })
      .forEach(function(a) { ret.push(a); }) ;
  }

  return ret;
}

var FUNCTION_ARGS = /function[^\(]*\(([^\)]+)/;

