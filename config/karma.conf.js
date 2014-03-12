module.exports = function (config) {
    config.set({
        basePath: '../',

        files: [
            'app/lib/angular/angular.js',
            'app/lib/angular-cookies/angular-cookies.js',
            'app/lib/angular-translate/*min.js',
            'app/lib/angular-translate-storage-cookie/*min.js',
            'app/lib/messageformat/messageformat.js',
            'app/lib/messageformat/locale/de.js',
            'app/lib/angular-translate-interpolation-messageformat/angular-translate-interpolation-messageformat.js',
            'app/lib/angular-ui-router/release/angular-ui-router.js',
            'app/lib/angular-bootstrap/ui-bootstrap-*.js',
            'app/lib/angular-file-upload/angular-file-upload.js',
            'app/lib/momentjs/moment.js',
            'app/lib/momentjs/lang/de.js',
            'app/lib/restangular/dist/restangular.js',
            'app/lib/lodash/dist/lodash.js',
            'app/lib/angulartics/src/angulartics.js',
            'app/lib/angulartics/src/angulartics-ga.js',
            'app/lib/stacktrace.js',

            'app/yp.commons/angular-translate-loader-wti-partial.js',
            'app/yp.commons/yp.error.js',
            'app/yp.commons/yp.commons.js',
            'app/yp.activity/yp.activity.js',
            'app/yp.activity/yp.activitylog.js',
            'app/yp.assessment/yp.assessment.js',
            'app/yp.cockpit/yp.cockpit.js',
            'app/yp.organization/yp.organization.js',
            'app/yp.user/yp.user.js',

            'app/yp*/*.js',
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
