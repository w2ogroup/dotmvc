// Add all own properties of mixin to the prototype property of class T

module.exports = function __mixin(T, mixin)
{
  // If we're mixing in a class (constructor function), then first mix in all
  // things hanging directly off the mixin as "statics", then switch the mixin
  // ref to point to the prototype
  if (mixin instanceof Function) {
    for (var k in mixin) {
      T[k] = mixin[k];
    }
    mixin = mixin.prototype;
  }

  // Dump everything on the mixin into the prototype of our class
  for (var key in mixin)
    if (mixin.hasOwnProperty(key))
      T.prototype[key] = mixin[key];
};

