/**
 *
 * translationSource: source for the translation resources, values: 'local', 'wti'
 *
 *
 *
 */


var environmentConfig = {
    dev: {
        webclientUrl: 'http://localhost:9000',
        backendUrl: 'http://localhost:8000',
        translationSource: 'local',
        googleAnalytics: {
            webPropertyId: 'UA-39309635-2'
        },
        ui: {
            showUserFeedbackLink: true
        }
    },
    test: {
        webclientUrl: 'http://localhost:9000',
        backendUrl: 'http://localhost:8000',
        translationSource: 'local',
        googleAnalytics: {
            webPropertyId: 'UA-39309635-2'
        },
        ui: {
            showUserFeedbackLink: true
        }
    },
    ci: {
        webclientUrl: 'http://localhost:9000',
        backendUrl: 'https://cimaster.youpers.com/api',
        translationSource: 'local',
        googleAnalytics: {},
        ui: {
            showUserFeedbackLink: true
        }
    },
    cimaster: {
        webclientUrl: 'https://cimaster.youpers.com',
        backendUrl: 'https://cimaster.youpers.com/api',
        translationSource: 'local',
        googleAnalytics: {},
        ui: {
            showUserFeedbackLink: true
        }
    },
    uat: {
        backendUrl: 'https://uat.youpers.com/api',
        translationSource: 'wti',
        googleAnalytics: {
            webPropertyId: 'UA-39309635-2'
        },
        ui: {
            showUserFeedbackLink: true
        }
    },


    herokutest: {
        backendUrl: 'http://yp-backend-test.herokuapp.com',
        translationSource: 'wti',
        googleAnalytics: {
            webPropertyId: 'UA-39309635-2'
        }
    },
    nb: {
        backendUrl: 'https://nb.youpers.com/api',
        translationSource: 'wti',
        googleAnalytics: {}
    },
    prod: {
        backendUrl: 'https://api.youpers.com/api',
        translationSource: 'wti',
        googleAnalytics: {}
    }
};

module.exports = {
    environmentConfig: environmentConfig
};