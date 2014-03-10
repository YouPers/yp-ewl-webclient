exports.config = {

// uncomment the following line if you want to use a manually started selenium server
//    seleniumAddress: 'http://localhost:4444/wd/hub',

    chromeOnly: true,
    chromeDriver: '../node_modules/protractor/selenium/chromedriver',

    baseUrl: 'http://127.0.0.1:9000/',

    specs: ['../test/protractor/**/*.js'],
    // Options to be passed to Jasmine-node.
    jasmineNodeOpts: {
        showColors: true // Use colors in the command line report.
    }
}