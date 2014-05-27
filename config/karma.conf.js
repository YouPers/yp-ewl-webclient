module.exports = function (config) {
    config.set({
        basePath: '../',

        files: [
            'app/lib/angular/angular.js',
            'app/lib/angular-animate/angular-animate.js',
            'app/lib/angular-sanitize/angular-sanitize.js',
            'app/lib/angular-ui-utils/scrollfix.js',
            'app/lib/angular-cookies/angular-cookies.js',
            'app/lib/angular-translate/*.js',
            'app/lib/angular-translate-storage-cookie/*.js',
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
            'app/lib/angular-touch/angular-touch.js',
            'app/lib/venturocket-angular-slider/build/angular-slider.js',

            'app/components/components.js',
            'app/components/activity/activity.js',
            'app/components/assessment/assessment.js',
            'app/components/campaign/campaign.js',
            'app/components/health-coach/health-coach.js',
            'app/components/health-coach/health-coach.js',
            'app/components/notifications/notifications.js',
            'app/components/organization/organization.js',
            'app/components/user/user.js',
            'app/components/payment-code/payment-code.js',

            'app/dhc/dhc.js',
            'app/dhc/diary/diary.js',
            'app/dcm/dcm.js',
            'app/admin/admin.js',

            'app/admin/**/*.js',
            'app/dhc/**/*.js',
            'app/dcm/**/*.js',
            'app/yp.ewl/*.js',

            'app/components/**/*.js',

            'test/lib/angular/angular-mocks.js',
            'test/unit/**/*.js',
            'app/templates.js'
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
