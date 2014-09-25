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
    name: 'default',
    webclientUrl: 'unspecified: adjust-config.js',
    backendUrl: 'unspecified: adjust-config.js',
    translationSource: 'local',
    googleAnalytics: {
        webPropertyId: 'UA-39309635-4'
    },
    ui: {
        showUserFeedbackLink: true
    }
};

var specificConfigs = {
    dev: {
        name: 'dev',
        webclientUrl: 'http://localhost:9000',
        backendUrl: 'http://localhost:8000'
    },
    localvm: {
        // used to test from Windows VMs on your local machine,
        // REQUIRES: - a /etc/hosts entry for 'localvm' to the real IP of you mac
        //           - set the NODE_ENV to 'localvm' in the shell where your weblclient is grunted.
        name: 'localvm',
        webclientUrl: 'http://localvm:9000',
        backendUrl: 'http://localvm:8000'
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
    cimaster: { // used by automtatic deploys on cimaster machine
        name: 'cimaster',
        webclientUrl: 'https://cimaster.youpers.com',
        backendUrl: 'https://cimaster.youpers.com/api',
        googleAnalytics: {}
    },
    uat: {
        name: 'uat',
        backendUrl: 'https://uat.youpers.com/api',
        translationSource: 'local',
        googleAnalytics: {
            webPropertyId: 'UA-39309635-2'
        }
    },
    prod: {
        backendUrl: 'https://prod.youpers.com/api',
        googleAnalytics: {
            webPropertyId: 'UA-39309635-3'
        }
    }
};

module.exports = {
    environmentConfig: _.forEach(specificConfigs, function (conf, key) {
        _.defaults(conf, defaultConfig);
    })
};
