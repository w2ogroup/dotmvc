var _ = require('underscore');

module.exports = Route;

/**
 * @constructor
 */
function Route(pattern, action)
{
  this.pattern   = pattern || null;
  this.action    = action || null;

  this._defaults  = {};
  this._wheres    = {};
  this._name      = '';
  this._compiled = null;
}

/**
 * Enforce a parameter matches some condition.
 * @param {String} parameter
 * @param {function(value:String): bool} condition
 * @return {Route}
 *
 */
Route.prototype.where = function(parameter, condition)
{
  if (this._wheres[parameter])
    throw new Error('Duplicate where condition');

  // Also allow a regex
  if (condition instanceof RegExp) {
    var r = condition;
    condition = function(p) { return r.test(p); };
  }

  this._wheres[parameter] = condition;
  return this;
};

/**
 * Provide a default value for a parameter.
 * @param {String} parameter
 * @param {*} value
 * @param {Route}
 */
Route.prototype.default = function(parameter, value)
{
  if (this._defaults[parameter])
    throw new Error('Duplicate default parameter');

  this._defaults[parameter] = value;
  return this;
};

/**
 * Give a route a name for inverse routing
 * @param {String} name
 * @return {Route}
 */
Route.prototype.named = function(name)
{
  if(this._name)
    throw new Error('Name already set');

  this._name = name;
  return this;
};

/**
 * @return {Array.<String>}
 */
Route.prototype.getParameterList = function()
{
  var match;
  var ret = [];
  var re = /{([^}\?\.]+)/g;

  while((match = re.exec(this.pattern))) {
    ret.push(match[1]);
  }

  return ret;
};

/**
 * @return {RegExp} Pattern regex.
 */
Route.prototype.getPatternRegExp = function()
{
  if (this._compiled) return this._compiled;

  // Build it.
  var regex = '^\/?';
  var p = this.pattern

    // Okay to have leading slash
    .replace(/^\//, '')

    // Optional rest params
    .replace(/\/{[^\.}?]+\.\.\.\?}/g, '/?(.+)?')

    // Rest params
    .replace(/\/{[^\.}?]+\.\.\.}/g, '/(.+)')

    // optional params
    .replace(/\/{([^\?}]+)\?}/g, '/?([^/]+)?')

    // definite params
    .replace(/\/{([^}]+)}/g, '/([^/]+)');


  regex += p + '/?$';

  this._compiled = new RegExp(regex);
  return this._compiled;
};

/**
 * @param {Object} params
 */
Route.prototype.getUriFromParams = function(params)
{
  var key, p;

  // Shallow copy
  var _params = {};
  for (key in params)
    _params[key] = params[key];

  // Drop in defaults
  for (key in this._defaults) {
    p = _params[key];
    var def = this._defaults[key];
    _params[key] = p !== undefined ? p : def;
  }

  // Ensure where clauses are met
  for (key in this._wheres) {
    var check = this._wheres[key];
    p = _params[key];
    if (p !== undefined && !check(p))
      throw new Error('Unmet where clause for parameter ' + key);
  }

  // Drop all of our params into the pattern. We start with the pattern and
  // remove them one by one.
  var uri = this.pattern;
  for (key in _params) {
    var re = new RegExp('{' + key + '[^}]*}');
    uri = uri.replace(re, _params[key]);
  }

  // Remove remaining keys (optional, no defaults)
  uri = uri.replace(/\/{[^}]+}/, '');

  console.log(uri);
  return uri;
};

/**
 * Attempts to see if a URI matches our route by looking at the pattern and
 * parameters specified
 * @param {String} uri
 * @return {null|Object} Map of params to their values (or null if not found)
 */
Route.prototype.getParamsFromUri = function(uri)
{
  var BAD = null;

  // Get params
  var matches = this.getPatternRegExp().exec(uri);
  if (!matches) return BAD;

  // Map our matches params to what we know are the params from the pattern.
  var params = {};
  var paramNames = this.getParameterList();
  for (var n = 1; n < matches.length; n++) {
    params[paramNames[n-1]] = matches[n];
  }

  // Check our where clauses out and apply defaults
  for (var key in this._wheres) {
    var check = this._wheres[key];
    var p     = params[key];

    if (p !== undefined && !check(p))
      return BAD;
  }

  // Check defaults
  for (key in this._defaults) {
    var def = this._defaults[key];
    if (params[key] === undefined)
      params[key] = def;
  }

  return params;
};

