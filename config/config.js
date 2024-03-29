/**
 *
 * environment config, used by grunt to produce an environment specific build based on the node env
 *
 * IMPORTANT: This file is not packaged and sent to the client, BUT the grunt task produces a
 * environment-specific index.html based on the NODE_ENV variable that grunt finds when executing 'grunt build'.
 * Grunt calls "environmentConfig[process.env.NODE_ENV || 'dev'] to get the correct config object.
 *
 * explanations for supported config parameters:
 *
 * - translationSource: source for the translation resources, values: 'local', 'wti'
 *
 *
 *
 */
var _ = require('lodash');

var defaultConfig = {
    version: '0',
    name: process.env.NODE_ENV || 'dev',
    webclientUrl: 'https://'+ process.env.NODE_ENV +'.youpers.com',
    backendUrl: 'https://'+ process.env.NODE_ENV +'.youpers.com/api',
    translationSource: 'local',
    googleAnalytics: {
        webPropertyId: 'UA-39309635-4'
    },
    ui: {
        showUserFeedbackLink: true
    },
    availableLanguages: ['en', 'de', 'fr', 'it'],
    languageMappings: {
        'en_US': 'en',
        'en_UK': 'en',
        'en_GB': 'en',
        'de_DE': 'de',
        'de_CH': 'de'
    },
    paymentCodeChecking: 'enabled',
    avatarFileSizeLimit: 8 * 1024 * 1024 // 8MB
};

var specificConfigs = {
    default: {},
    dev: {
        name: 'dev',
        webclientUrl: 'http://localhost:9000',
        backendUrl: 'http://localhost:8000',
        paymentCodeChecking: 'disabled'
    },
    localvm: {
        // used to test from Windows VMs on your local machine,
        // REQUIRES: - a /etc/hosts entry for 'localvm' to the real IP of you mac
        //           - set the NODE_ENV to 'localvm' in the shell where your weblclient is grunted.
        name: 'localvm',
        webclientUrl: 'http://localvm:9000',
        backendUrl: 'http://localvm:8000',
        paymentCodeChecking: 'disabled'
    },

// RBLU: I think this is not used anywhere, so commenting out and checking in to see what happens
//    test: {
//        name: 'test',
//        webclientUrl: 'http://localhost:9000',
//        backendUrl: 'http://localhost:8000'
//    },
    ci: { // used by circleci shell when building no the circleci vm
        name: 'ci',
        webclientUrl: 'http://localhost:9000',
        backendUrl: 'https://cimaster.youpers.com/api',
        googleAnalytics: {}
    },
    "hc-ci": { // used by automtatic deploys on cimaster machine
        googleAnalytics: {},
        availableLanguages: [ 'de', 'fr', 'en'],
        languageMappings: {
            'en_US': 'de',
            'en_UK': 'de',
            'en_GB': 'de',
            'de_DE': 'de',
            'de_CH': 'de',
            'en': 'de',
            'fr': 'de',
            'it': 'de'
        },
        paymentCodeChecking: 'disabled'
    },
    "hc-uat": {
        name: '',
        translationSource: 'wti',
        googleAnalytics: {
            webPropertyId: 'UA-39309635-2'
        }

    },
    "hc-content": {
        name: 'content',
        googleAnalytics: {}
    },
    prod: {
        name: '',
        webclientUrl: 'https://hc.youpers.com',
        backendUrl: 'https://hc.youpers.com/api',
        googleAnalytics: {
            webPropertyId: 'UA-39309635-3'
        },
        availableLanguages: [ 'de', 'fr', 'en'],
        languageMappings: {
            'en_US': 'en',
            'en_UK': 'en',
            'en_GB': 'en',
            'de_DE': 'de',
            'de_CH': 'de',
            'en': 'en',
            'fr': 'fr',
            'it': 'de'
        }
    }
};

module.exports = {
    environmentConfig: _.forEach(specificConfigs, function (conf, key) {
        _.defaults(conf, defaultConfig);
    })
};
