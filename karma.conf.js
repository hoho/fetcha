// Karma configuration
// Generated on Mon Sep 29 2014 20:20:06 GMT+0400 (MSK)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '.',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'testapi'],


    // list of files / patterns to load in the browser
    files: [
        'fetcha.js',
        'test/test.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher

    // window.history.back() is asynchronous in Webkits, so we're using just
    // Firefox for the moment. Travis supports Firefox too.
    browsers: ['Firefox'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    plugins: ['karma-*', {'framework:testapi': ['factory', testapi]}]
  });
};


function testapi(customFileHandlers) {
    customFileHandlers.push({
        urlRegex: /.*\/api\/.*/,
        handler: function(request, response) {
            var ret = {
                url: request.url,
                method: request.method
            };

            var data = [];

            request.on('data', function(chunk) {
                data.push(chunk.toString());
            });

            request.on('end', function() {
                if (data.length) {
                    ret.body = data.join('');
                }
                response.writeHead(200);
                response.end(JSON.stringify(ret));
            });
        }
    });
}
