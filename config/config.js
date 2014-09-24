/**
 *
 * translationSource: source for the translation resources, values: 'local', 'wti'
 *
 *
 *
 */


var environmentConfig = {
    dev: {
        name: 'dev',
        webclientUrl: 'http://dev:9000',
        backendUrl: 'http://dev:8000',
        translationSource: 'local',
        googleAnalytics: {
            webPropertyId: 'UA-39309635-4'
        },
        ui: {
            showUserFeedbackLink: true
        }
    },
    test: {
        name: 'test',
        webclientUrl: 'http://dev:9000',
        backendUrl: 'http://dev:8000',
        translationSource: 'local',
        googleAnalytics: {
            webPropertyId: 'UA-39309635-4'
        },
        ui: {
            showUserFeedbackLink: true
        }
    },
    ci: {
        name: 'ci',
        webclientUrl: 'http://localhost:9000',
        backendUrl: 'https://cimaster.youpers.com/api',
        translationSource: 'local',
        googleAnalytics: {},
        ui: {
            showUserFeedbackLink: true
        }
    },
    cimaster: {
        name: 'cimaster',
        webclientUrl: 'https://cimaster.youpers.com',
        backendUrl: 'https://cimaster.youpers.com/api',
        translationSource: 'local',
        googleAnalytics: {},
        ui: {
            showUserFeedbackLink: true
        }
    },
    uat: {
        name: 'uat',
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