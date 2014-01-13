var _ = require('underscore');

module.exports = UiManager;

/**
 * @constructor
 */
function UiManager(htmlRoot, resolver)
{
  this.resolver = resolver;
  this.html     = htmlRoot;

  this._templates = [];
  this._content = null;
}

/**
 * Add a template to the UI Manager.
 * @param {String|Function} viewType Type parameter passed to the resolver if
 * we are going to use this template. Needs to be a constructor function,
 * factory function, dependency name, or instance.
 * @param {function(content:Object): bool} condition Function that should
 * return true if this template should be applied to a given content.
 */
UiManager.prototype.registerTemplate = function(viewType, condition)
{
  var callback = condition;

  // Always fire a callback. If not a function, assume we want to check if it
  // is an instnaceof
  if (!(condition instanceof Function))
    callback = function(content) { return content instanceof condition; };

  // Empty condition means always true
  if (!condition)
    callback = function() { return true; };

  this._templates.push({
    T: viewType,
    callback: callback
  });
};

/**
 * Check our templates and conditions to see what view we would use for given
 * content.
 * @param {Object} content
 * @return {Renderable}
 */
UiManager.prototype.getViewFor = function(content)
{
  var template = _(this._templates).find(function(template) {
    if (template.callback(content))
      return true;
  });

  if (template) return this.resolver.make(template.T);
};

/**
 * Instruct the UI manager to somehow display some content.
 * @param {Object} content
 */
UiManager.prototype.setContent = function(content)
{
  if (content === this._content) return;

  var view = this.getViewFor(content);

  if (view && view.setDataContext instanceof Function) {
    view.setDataContext(content);
    this.html.innerHTML = '';
    this.html.appendChild(view.element);
  } else if (view instanceof Function) {
    this.html.innerHTML = view(content);
  } else {
    this.html.innerHTML = ''+content;
  }

  this._content = content;
};



