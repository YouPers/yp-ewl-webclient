var envConfig = require('./config.js').environmentConfig[process.env.NODE_ENV || 'dev'];

var config = {

    seleniumAddress: 'http://10.111.111.14:4444/wd/hub',

    multiCapabilities: [
        {
            'browserName': 'internet explorer'
        },
        {
            'browserName': 'chrome'
        },
        {
            'browserName': 'firefox'
        }
    ],

    baseUrl: envConfig.webclientUrl,

    specs: ['../test/protractor/**/*.js'],

    jasmineNodeOpts: {
        showColors: true // Use colors in the command line report.
    }
};

exports.config = config;