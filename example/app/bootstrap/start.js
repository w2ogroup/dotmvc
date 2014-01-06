var Framework = require('dotmvc').Framework;

// ----------------------------------------------------------------------------
// Init all facades and IoC stuff

var app = new Framework();
app.start();

// ----------------------------------------------------------------------------
// Bring in routes

require('../routes.js');

