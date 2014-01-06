var Route          = require('dotmvc').Route;
var HomeController = require('./controllers/HomeController.js');

// ----------------------------------------------------------------------------
// Create our routes...

Route.controller('home', HomeController);

Route.get('neato', function() {
  return 'This is neat!';
});

Route.controller('show/{count}/something', HomeController, 'show')
  .where({ count: /\d+/ });

