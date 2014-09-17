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
            webPropertyId: 'UA-39309635-4'
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
            webPropertyId: 'UA-39309635-4'
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
        translationSource: 'local',
        googleAnalytics: {
            webPropertyId: 'UA-39309635-2'
        },
        ui: {
            showUserFeedbackLink: true
        }
    },
    nb: {
        backendUrl: 'https://nb.youpers.com/api',
        translationSource: 'wti',
        googleAnalytics: {}
    },
    prod: {
        backendUrl: 'https://prod.youpers.com/api',
        translationSource: 'local',
        googleAnalytics: {
            webPropertyId: 'UA-39309635-3'
        },
        ui: {
            showUserFeedbackLink: true
        }
    }
};

module.exports = {
    environmentConfig: environmentConfig
};