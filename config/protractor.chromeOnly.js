var envConfig = require('./config.js').environmentConfig[process.env.NODE_ENV || 'dev'];

var config = {

    chromeOnly: true,
    chromeDriver: '../node_modules/protractor/selenium/chromedriver',

    baseUrl: envConfig.webclientUrl,

    specs: ['../test/protractor/login.js', '../test/protractor/**/*.js'],

    jasmineNodeOpts: {
        showColors: true // Use colors in the command line report.
    }
};

exports.config = config;