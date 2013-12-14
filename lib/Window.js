var View      = require('./View.js');
var __extends = require('./util/extends.js');

module.exports = Window;
__extends(Window, View);

// View object that is bound to the root <body> element for cross-cutting view
// concerns across teh entire application
function Window()
{
  Window.Super.apply(this, arguments);
  this.onMessage({ alert: this.alert });
}

// Annoying alert box
Window.prototype.alert = function(txt, message)
{
  if (message)
    message.preventOthers();
  alert(txt);
};


