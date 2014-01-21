module.exports = function (config) {
    config.set({
        basePath: '../',

        files: [
            'app/lib/angular/angular.js',
            'app/lib/angular-cookies/angular-cookies.js',
            'app/lib/angular-translate/*min.js',
            'app/lib/angular-translate-storage-cookie/*min.js',
            'app/lib/angular-ui-router/release/angular-ui-router.js',
            'app/lib/angular-bootstrap/ui-bootstrap-*.js',
            'app/lib/momentjs/moment.js',
            'app/lib/momentjs/lang/de.js',
            'app/lib/restangular/dist/restangular.js',
            'app/lib/lodash/dist/lodash.js',
            'app/yp*/**/*.js',

            'test/lib/angular/angular-mocks.js',
            'test/unit/**/*.js'
        ],

        frameworks: ["jasmine"],
        autoWatch: true,

        browsers: ['PhantomJS'],
        singleRun: true,

        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }

    });
};
