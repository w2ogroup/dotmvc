module.exports = Repository;

/**
 * A general purpose heirarchal key-value store
 * @constructor
 */
function Repository()
{
  this._repo = {};
}

/**
 * @return {bool} True if the store has a key.
 * @param {String} key
 */
Repository.prototype.has = function(key)
{
  return this.get(key) !== undefined;
};

/**
 * Get a value from the repository.
 * @param {String} key
 */
Repository.prototype.get = function(key)
{
  if (!key) return;

  var parts = key.split('.');
  var root = this._repo;

  for (var n = 0; n < parts.length - 1; n++) {
    var p = parts[n];
    if (root[p] === undefined) return undefined;
    root = root[p];
  }

  return root[parts[parts.length-1]];
};

/**
 * Add in an object to our current repository
 * @param {Object} options Hash of props.
 */
Repository.prototype.merge = function(options)
{
  deepExtend(this._repo, options);
};

function deepExtend(target, source)
{
  for (var prop in source) {
    if (prop in target && typeof target[prop] === 'object') {
      deepExtend(target[prop], source[prop]);
    } else {
      target[prop] = source[prop];
    }
  }
}

/**
 * @param {String} key
 * @param {*} value
 */
Repository.prototype.set = function(key, value)
{
  if (!key) return;
  if (typeof key === 'object') return this.merge(key);

  var parts = key.split('.');
  var root = this._repo;

  // Move root pointer to second-to-last part of the dot expression, creating
  // nodes along the way if we don't have them
  for (var n = 0; n < parts.length - 1; n++) {
    var p = parts[n];
    if (root[p] !== undefined) {
      root = root[p];
      continue;
    }
    var _ref = {};
    root[p] = _ref;
    root = _ref;
  }

  root[parts[parts.length - 1]] = value;
};


