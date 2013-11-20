module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Check syntax
    jshint: {
      lib: ['lib/**/*.js'],
      grunt: ['Gruntfile.js'],
      test: ['test/unit/**/*.js', 'test/main.js'],

      options: { jshintrc: '.jshintrc' }
    },

    // Compile JS and handlebars templates
    browserify: {
      test: {
        src: ['test/main.js'],
        dest: 'test/bin/main.js',
        options: {
          debug: true,
          transform: ['coffeeify']
        }
      }
    }
  });

  // plugins
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('default', [
    'jshint',
    'browserify'
  ]);

};
