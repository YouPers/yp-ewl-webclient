module.exports = function (config) {
    config.set({
        basePath: '../',

        files: [
            'app/lib/angular/angular.js',
            'app/lib/angular/angular-*.js',
            'test/lib/angular/angular-mocks.js',
            'app/js/**/*.js',
            'test/unit/**/*.js'
        ],

        frameworks: ["jasmine"],
        autoWatch: true,

        browsers: ['Chrome'],
        singleRun: true,

        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }

    });
};
