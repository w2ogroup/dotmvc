# Dot MVC

[![Build Status](https://travis-ci.org/bvalosek/dotmvc.png?branch=master)](https://travis-ci.org/bvalosek/dotmvc)
[![NPM version](https://badge.fury.io/js/dotmvc.png)](http://badge.fury.io/js/dotmvc)

## Installation

**Dot MVC** is meant to be used with [Browserify](http://browserify.org/),
which lets you write client-side Javascript with the CommonJS-style module
pattern that compiles down to a single bundle file.

This ultimately keeps your code more organized, allows for better dependency
management with `npm`, and streamlines development-to-production workflows.

```
npm install dotmvc
```

## Browser Support

**Dot MVC** is a modern Javascript framework that makes liberal use of the ES5
feature set. This includes the new `Array.prototype` methods as well as
frequent use of `Object.defineProperty()`.

A modern, compliant browser is required.

* Chrome
* Firefox
* Safari
* Opera
* IE 9+

## Testing

Unit testing is done by [QUnit](http://qunitjs.com/) and can be run from the
command line via [Grunt](http://gruntjs.com/).

Testing requires [node/npm](http://nodejs.org) and
[grunt-cli](https://github.com/gruntjs/grunt-cli) to be installed on your
system, as well as [bower](https://github.com/bower/bower).

To ensure you have the required apps:

```
npm install -g bower grunt-cli
```

Then install all the dev dependencies and run the tests:

```
npm install
bower install
grunt test
```

## License
Copyright 2013 Brandon Valosek

**Dot MVC** is released under the MIT license.

