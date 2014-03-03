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
        translationSource: 'local'
    },
    dev: {
        backendUrl: 'http://localhost:8000',
        translationSource: 'local'
    },
    ci: {
        backendUrl: 'http://yp-backend-ci.herokuapp.com',
        translationSource: 'wti'
    },
    herokutest: {
        backendUrl: 'http://yp-backend-test.herokuapp.com',
        translationSource: 'wti'
    },
    nb: {
        backendUrl: 'https://nb.youpers.com/api',
        translationSource: 'wti'
    },
    uat: {
        backendUrl: 'https://uat.youpers.com/api',
        translationSource: 'wti'
    },
    prod: {
        backendUrl: 'https://api.youpers.com/api',
        translationSource: 'wti'
    }
};

module.exports = {
    environmentConfig: environmentConfig
};