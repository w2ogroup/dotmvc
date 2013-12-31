var __extends = require('./util/extends.js');

module.exports = Resolver;

/**
 * Basic dependency resolver that allows for the registering of types and
 * factories via callback functions, as well as auto-guessing constructor
 * injecting via parameter names
 * @constructor
 */
function Resolver()
{
  this._types = {};
}

/**
 * Register something into this resolver.
 * @param {String} name The name we want register something under.
 * @param {Function} T The class constructor of the type we want to register.
 * @param {boolean=} shared If true, this dep will only be instantiated once (a
 * la singleton)
 */
Resolver.prototype.register = function(name, T, shared)
{
  if (this._types[name])
    throw new ResolverInternalError(
      'Already registered dependency: "' + name + '"');

  // Determine if there are any other deps in here
  var deps = getArgs(T);

  this._types[name] = {
    type: T,
    deps: deps,
    shared: !!shared,
    instance: null
  };
};

/**
 * Register a singleton (instantiated-once) dependency into this resolver.
 * @param {String} name The name we want register something under.
 * @param {Function} T The class constructor of the type we want to register.
 */
Resolver.prototype.singleton = function(name, T)
{
  return this.register(name, T, true);
};

/**
 * Create an object while resolving any dependencies we have have
 * @param {String} name The string tag of the dependency we want to create.
 */
Resolver.prototype.make = function(name)
{
  var info = this._resolve(name);

  // Resolve all string deps into make deps
  var _this = this;

  var instance;

  if (!info.shared || !info.instance) {
    var deps = info.deps.map(function(d) { return _this.make(d); });
    instance = callNew(info.type, deps);

    // Stash singleton
    if (info.shared)
      info.instance = instance;
  } else {
    instance = info.instance;
  }

  return instance;
};


function callNew(T, args)
{
  return new (Function.prototype.bind.apply(T, [null].concat(args)))();
}

/**
 * Create an object by resolving deps for a class not in the container (but
 * whose deps are)
 * @param {Function} T Constructor function.
 */
Resolver.prototype.makeFromConstructor = function(T)
{
  var _this = this;
  var deps = getArgs(T).map(function(d) { return _this.make(d); });
  return callNew(T, deps);
};

/**
 * Resolve the name of a dep
 * @private
 * @param {String} name The dep name.
 * @return {{type: Function, deps: Array.<String>}} Type T.
 */
Resolver.prototype._resolve = function(name)
{
  var info = this._types[name];
  if (!info)
    throw new ResolverInternalError(
      'Cannot resolve dependency "' + name + '"');
  return info;
};

/**
 * @private
 * @return {Array.<String>}
 */
function getArgs(f)
{
  var ret = [];
  var args = f.toString().match(/function\s?[^\(]?\(([^\)]+)/);

  if (args) {
    args[1].replace(/[ ]*,[ ]*/, ',')
      .split(',')
      .map(function(s) { return s.trim(); })
      .forEach(function(a) { ret.push(a); })
      ;
  }

  return ret;
}

/**
 * Exception class for when something goes wrong inside of the resolver.
 * Indicates a logical mistake during runtime.
 * @constructor
 */
Resolver.ResolverInternalError = ResolverInternalError;
__extends(ResolverInternalError, Error);
function ResolverInternalError(message)
{
  ResolverInternalError.Super.apply(this, arguments);
  this.message = message;
}



