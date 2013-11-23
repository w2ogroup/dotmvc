# View example

When creating your own custom views, use the `extends` method in the `Util`
class to subclass `View`. Below is a fairly comprehensive example:

```javascript
var View       = require('dotmvc/lib/View');
var Binding    = require('dotmvc/lib/Binding');
var __extends  = require('dotmvc/lib/util/extends');

var DetailView = require('./DetailView.js');

module.exports = (function(_super) {
  __extends(MyCoolView, _super);

  // The templating function (via Handlebar and hbsfy)
  MyCoolView.LAYOUT = require('./layouts/cool-layout.hbs');

  // Call the base constructor
  function MyCoolView()
  {
    _super.apply(this, arguments);

    this.toggled = false;
  }

  // All initial, one-time setup we need to do
  MyCoolView.prototype.init = function()
  {
    // Call base class init will handle getting the layout for us
    _super.prototype.init.call(this);

    // Create a subview whose context is bound to THIS view's context's
    // currentItem proprety
    this.createViews({
      '.detail-view': {
        View: DetailView,
        context: new Binding(this, 'context.currentItem');
      }
    });

    // Listen to view DOM events and call our member functions
    this.delegate('.toggler', 'click', this.onTogglerClick);

    // Throw command up to higher level
    this.delegateCommand('.exit-button', 'click', { exitApp: null });
  };

  // Update any part of the view we need to
  MyCoolView.prototype.render = function()
  {
    _super.prototype.render.apply(this, arguments);

    if (!this.context) return;

    this.$('h2').html(this.context.title);
    this.$('.label').html('Toggle is ' + this.togged);
  };

  // Delegated callback
  MyCoolView.prototype.onTogglerClick = function(e)
  {
    this.toggled = !this.toggled;
    this.render();
  };

  return MyCoolView;

})(View);
```
