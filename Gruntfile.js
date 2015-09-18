/*jslint node: true, unparam: true, vars: true, es5: true, white: true, nomen: true*/
'use strict';

module.exports = function(grunt) {

  var globalConfig = {};
  // Project configuration.
  grunt.initConfig({
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          clearRequireCache: true,
          timeout: 5000,
          require: 'coverage/blanket'
        },
        src: ['test/**/*.js']
      },
      coverage: {
        options: {
          reporter: 'html-cov',
          // use the quiet flag to suppress the mocha console output
          quiet: true,
          // specify a destination file to capture the mocha
          // output (the quiet option does not suppress this)
          captureFile: 'coverage.html'
        },
        src: ['test/**/*.js'],
        // specify a destination file to capture the mocha
        // output (the quiet option does not suppress this)
        dest: 'coverage.html'
      },
      // The travis-cov reporter will fail the tests if the
      // coverage falls below the threshold configured in package.json
      'travis-cov': {
        options: {
          reporter: 'travis-cov'
        },
        src: ['test/**/*.js']
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib: {
        src: ['lib/**/*.js']
      },
      test: {
        src: ['test/**/*.js']
      },
    },
    simplemocha: {
      options: {
        globals: ['should'],
        timeout: 60000,
        clearRequireCache: true,
        ignoreLeaks: false,
        ui: 'bdd',
        reporter: 'spec'
      },
      all: {
        src: ['test/**/*.js']
      },
      spec: {
        src: ['test/<%= globalConfig.file %>.js']
      }
    },
    shell: {
      test: {
        options: {
          stdout: true
        },
        command: 'node --harmony $(which grunt) mochaTest'
      },
      testlive: {
        options: {
          stdout: true
        },
        command: 'NOCK_OFF=true node --harmony $(which grunt) mochaTest'
      },
      debugtest: {
        options: {
          stdout: true
        },
        command: 'node --debug --harmony $(which grunt) test'
      },
      debugtestdev: {
        options: {
          stdout: true
        },
        command: 'NOCK_OFF=true node --debug --harmony $(which grunt) test'
      }
    },
    'node-inspector': {
      custom: {
        options: {
          'save-live-edit': true,
          'no-preload': true,
          'hidden': ['node_modules']
        }
      }
    },
    concurrent: {
      testd: ['node-inspector', 'shell:debugtest'],
      testdevd: ['node-inspector', 'shell:debugtestdev'],
      options: {
        logConcurrentOutput: true
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib: {
        files: '<%= jshint.lib.src %>',
        tasks: ['jshint:lib', 'nodeunit']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'mochaTest']
      },
    },
  });

  grunt.registerTask('spec', 'Runs a task on a specified file', function (fileName) {
    globalConfig.file = fileName;
    grunt.task.run('simplemocha:spec');
  });

  grunt.registerTask('debug', ['nodemon']);
  grunt.registerTask('basic', ['shell:test']);
  grunt.registerTask('live', ['shell:testlive']);
  grunt.registerTask('basic-live', ['shell:testlive']);
  grunt.registerTask('debug-test', ['concurrent:testd']);
  grunt.registerTask('debug-test-live', ['concurrent:testdevd']);
  grunt.registerTask('test', ['jshint', 'simplemocha:all']);
  grunt.registerTask('default', ['basic']);

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
//  grunt.loadNpmTasks('grunt-mocha-test');
//  grunt.loadNpmTasks('grunt-contrib-jshint');
//  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
//  grunt.registerTask('default', ['jshint', 'mochaTest']);
//  grunt.registerTask('default', ['test']);
};
