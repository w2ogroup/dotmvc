module.exports = stringy;

/**
 * Return a mixin-able hash that contains a toString function that display a
 * nice value for us when cast to a string. Mixin on the base class in order to
 * show when using a inherited class as well.
 * @param {Function} T Constructor function to create the mixin for
 * @example
 * __mixin(MyClass, stringy(MyClass));
 *
 * function MyClass()
 * {
 *   ...
 * }
 */
function stringy(T)
{
  return {
    toString: function() {
      var s = '[' + T.name;
      s += this.constructor !== T ? '::' + this.constructor.name : '';
      if (this.id) s += ' ' + this.id;
      s += ']';
      return s;
    }
  };
}
