'use strict';

var gulp = require('gulp');

var eslint = require('gulp-eslint');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

var path = require('path');


gulp.task('eslint', function() {
    return gulp.src(['gulpfile.js', 'fetcha.js'])
        .pipe(eslint({
            rules: {
                'quotes': [2, 'single'],
                'no-shadow-restricted-names': 0,
                'no-underscore-dangle': 0,
                'no-use-before-define': [2, 'nofunc'],
                'no-new': 0,
                'new-cap': 0,
                'no-multi-spaces': 0,
                'comma-spacing': 0
            },
            env: {
                'node': true,
                'browser': true
            }
        }))
        .pipe(eslint.format());
});


gulp.task('uglify', function() {
    return gulp.src(['fetcha.js'])
        .pipe(uglify({preserveComments: 'some'}))
        .pipe(rename('fetcha.min.js'))
        .pipe(gulp.dest('.'));
});


gulp.task('assert-version', function(err) {
    var assertVersion = require('assert-version');

    err(assertVersion({
        'fetcha.js': '',
        'bower.json': ''
    }));
});


gulp.task('test', function(done) {
    var karma = require('karma').server;
    karma.start({
        configFile: path.join(__dirname, 'karma.conf.js'),
        singleRun: true
    }, function() { done(); });
});


gulp.task('default', ['eslint', 'uglify', 'assert-version', 'test']);
