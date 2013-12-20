var FUNCTION = function() { throw 'Not implemented.'; };

var __interface = {

  /**
   * @param {Function} T Constructor of the class we want to check
   * @param {Function} I Interface-style constructor
   * @return {boolean} True if type T implements interface I
   */
  check: function(T, I)
  {
    if (!(T instanceof Function)) return false;
    if (!(I instanceof Function)) return false;

    // Check all prototype methods
    var C = function() {};
    C.prototype = T.prototype;
    var instance = new C();
    for (var name in I.prototype) {
      var type   = I.prototype[name];
      var member = instance[name];

      if (type === FUNCTION && !(member instanceof Function))
        return false;
    }

    // Made it
    return true;
  },

  /**
   * Convert a class into a non-instantiatable interface.
   * @param {Function} T Constructor of the class we want to create an
   * interface for.
   * @return {Function} A modified class.
   */
  define: function(T)
  {
    var I = function() { throw 'Cannot instantiate interface'; };

    for (var key in T.prototype) {
      var member = T.prototype[key];
      if (member instanceof Function)
        I.prototype[key] = FUNCTION;
    }

    return I;
  }

};

module.exports = __interface;

