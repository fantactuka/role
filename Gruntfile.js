module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('bower.json'),

    karma: {
      options: {
        configFile: 'spec/karma-conf.js',
        browsers: ['PhantomJS'],
        singleRun: true,
        autoWatch: false
      },
      ci: {
        options: {
          reporters: ['dots'],
          singleRun: true
        }
      },
      watch: {
        options: {
          browsers: ['Chrome'],
          reporters: ['dots', 'growl'],
          singleRun: false,
          autoWatch: true
        }
      },
      coverage: {
        options: {
          reporters: ['coverage'],
          preprocessors: {
            'role.js': 'coverage'
          }
        }
      }
    },
    uglify: {
      'role-min.js': ['role.js']
    },
    jshint: {
      all: [
        'Gruntfile.js',
        'spec/**/*spec.js',
        'role.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    version: {
      update: {
        src: ['component.json', 'package.json']
      }
    }
  });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-version');

  grunt.registerTask('test', ['jshint', 'karma:ci']);
  grunt.registerTask('default', ['test']);

  grunt.registerTask('release', 'Releasing new version with update version', function() {
    var type = this.args[0] || 'patch';
    grunt.task.run(['test', 'version:update:' + type, 'uglify']);
  });
};
