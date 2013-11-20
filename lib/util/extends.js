// The well documented, oft-used (Coffeescript, Typescript, ES6... etc) extends
// pattern to get some sort of single-inheritance in Javascript.  Modify a
// Child class to have inherited the static members via copying and link the
// prototypes.

module.exports = function __extends(Child, Parent)
{
  for (var key in Parent)
    if (Parent.hasOwnProperty(key))
      Child[key] = Parent[key];

  // ES5 Style to keep constructor hidden
  function T() {
    Object.defineProperty(this, 'constructor', {
      enumerable: false,
      writable: false,
      value: Child
    });
  }

  T.prototype = Parent.prototype;

  Child.prototype = new T();
};

