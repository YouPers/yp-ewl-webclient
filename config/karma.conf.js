module.exports = function (config) {
    config.set({
        basePath: '../',

        files: [
            'app/lib/angular/angular.js',
            'app/lib/angular/angular-cookies.js',
            'app/lib/angular-translate/*min.js',
            'app/lib/angular-translate-storage-cookie/*min.js',
            'app/lib/jquery/jquery-2.0.3.min.js',
            'app/lib/angular-ui-router/angular-ui-router.js',
            'app/lib/angular-bootstrap/ui-bootstrap-*.js',
            'app/lib/jquery/jquery-2.0.3.min.js',
            'app/lib/momentjs/moment.js',
            'app/lib/momentjs/lang-de.js',
            'test/lib/angular/angular-mocks.js',
            'app/js/**/*.js',
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
