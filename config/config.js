/**
 *
 * translationSource: source for the translation resources, values: 'local', 'wti'
 *
 *
 *
 */


var environmentConfig = {
    mock: {
        backendUrl: 'http://localhost:8000',
        translationSource: 'local',
        googleAnalytics: {}
    },
    dev: {
        backendUrl: 'http://localhost:8000',
        translationSource: 'local',
        googleAnalytics: {
            webPropertyId: 'UA-39309635-2'
        },
        ui: {
            showUserFeedbackLink: true
        }
    },
    cimaster: {
        backendUrl: 'http://cimaster.youpers.com:8000',
        translationSource: 'local',
        googleAnalytics: {}
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
    prod: {
        backendUrl: 'https://api.youpers.com/api',
        translationSource: 'wti',
        googleAnalytics: {}
    }
};

module.exports = {
    environmentConfig: environmentConfig
};