'use strict';
/*global angular:true */


// Declare app level module which depends on filters, and services
angular.module('yp-ewl',
        [
            'restangular', 'ui.router', 'ui.bootstrap',  'ngAnimate', 'ipCookie', 'LocalStorageModule',
            'angulartics','angulartics.google.analytics', 'nvd3ChartDirectives', 'ngBusy',

            'yp.config',

            'yp.components',


            'yp.admin',
            'yp.dhc',
            'yp.dcm',


            'templates-main'

        ]).

    config(['$stateProvider', '$urlRouterProvider', 'accessLevels', 'RestangularProvider', 'yp.config','$translateProvider', '$translateWtiPartialLoaderProvider', 'localStorageServiceProvider',
        function ($stateProvider, $urlRouterProvider, accessLevels, RestangularProvider, config, $translateProvider, $translateWtiPartialLoaderProvider, localStorageServiceProvider) {

            // For any unmatched url, send to /home
            $urlRouterProvider.otherwise('/dispatch');

            // Now set up the states
            $stateProvider
                .state('homedispatcher', {
                    url: "/dispatch",
                    access: accessLevels.all,
                    controller: ['UserService', '$state', function (UserService, $state) {
                        var user = UserService.principal.getUser();
                        if (!UserService.principal.isAuthenticated()) {
                            return $state.go('signin.content');
                        } else if (UserService.principal.isAuthorized(accessLevels.admin)) {
                            return $state.go('admin-home.content');
                        } else if (UserService.principal.isAuthorized(accessLevels.campaignlead) || UserService.principal.isAuthorized(accessLevels.orgadmin)) {
                            return $state.go('dcm.home');
                        } else {
                            return $state.go('dhc.game', {view: "", campaignId: user.campaign && user.campaign.id || user.campaign});
//                            return $state.go('dhc.game', {view: ""});
                        }
                    }]
                })

                .state('error', {
                    url: "/error",
                    access: accessLevels.all,
                    template: "<html><body><h3>an error has occurred, we are working on it.</h3></body></html>"
                })

                .state('terms', {
                    url: "/terms",
                    templateUrl: "partials/terms.html",
                    access: accessLevels.all,
                    controller: ['$scope','$window', function($scope, $window) {
                        $scope.close = function() {
                            $window.close();
                        };
                    }]
                })

                // temporary bounce state while we wait for this bug to be fixed: https://github.com/angular-ui/ui-router/issues/76
                .state('bounce', {
                params: ['state', 'params'],
                template: '<h4>Loading stuff...</h4>', // you can even put some loading template here, wow!
                controller: ['$state', '$stateParams', function($state, $stateParams) {
                    // just redirect to caller
                    $state.go(
                        $stateParams.state,
                        JSON.parse($stateParams.params)
                    );
                }],
                access:  accessLevels.all
            });

            RestangularProvider.setBaseUrl(config && config.backendUrl || "");

            $translateProvider.
                registerAvailableLanguageKeys(['en', 'de', 'fr', 'it'], {
                    'en_US': 'en',
                    'en_UK': 'en',
                    'de_DE': 'de',
                    'de_CH': 'de'
                })
                .determinePreferredLanguage()
                .addInterpolation('$translateMessageFormatInterpolation')
                .useCookieStorage()
                .useLoader('$translateWtiPartialLoader', {
                    urlTemplate: '/{part}.translations.{lang}.json',
                    wtiProjectId: '8233-eWL',
                    wtiPublicApiToken: '8lfoHUymg_X8XETa_uLaHg',
                    fromWti: config.translationSource === 'wti'
                });
            $translateWtiPartialLoaderProvider.addPart('yp.ewl/yp.ewl');

            localStorageServiceProvider
                .setPrefix('yp-ewl');
        }])

/**
 * setup checking of access levels for logged in user.
 */
    .run(['$rootScope', '$state', '$stateParams', '$window', 'UserService', '$timeout', '$http', '$translate', 'yp.config', '$analytics', '$sce','tmhDynamicLocale',
        function ($rootScope, $state, $stateParams, $window, UserService, $timeout, $http, $translate, config, $analytics, $sce, tmhDynamicLocale) {

            // setup globally available objects on the top most scope, so all other controllers
            // do not have to inject them

            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
            $rootScope.principal = UserService.principal;
            $rootScope.currentLocale = $translate.use() || $translate.proposedLanguage();
            $rootScope.config = config;


            $rootScope.$on('event:authority-authorized', function() {

                $rootScope.isProductAdmin = _.any(UserService.principal.getUser().roles, function (role) {
                    return _.contains([
                        'productadmin',
                        'systemadmin'
                    ], role);
                });
                $rootScope.isCampaignAdmin = _.any(UserService.principal.getUser().roles, function (role) {
                    return _.contains([
                        'campaignlead',
                        'orgadmin',
                        'productadmin',
                        'systemadmin'
                    ], role);
                });


            });

            $rootScope.getRenderedText = function (text) {
                if (text) {
                    return $sce.trustAsHtml(marked(text));
                } else {
                    return "";
                }
            };


            // set the language to use for backend calls to be equal to the current GUI language
            // translate.use() returns undefined until the partial async loader has found the "proposedLanguage"
            // therefore we use in this case $translate.proposedLanguage()
            var localeToUse = $translate.use() || $translate.proposedLanguage();
            $http.defaults.headers.common['yp-language'] =  localeToUse;

            $translate.refresh();
            moment.locale(localeToUse);
            tmhDynamicLocale.set(localeToUse);
            $rootScope.currentLocale=localeToUse;

            // handle routing authentication
            $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
                console.debug('stateChangeStart from: ' + (fromState && fromState.name) + ' to: ' + toState.name);

                toState.previous = fromState;

                var requiredAccessLevel = toState.access;

                if (UserService.initialized) {
                    if (!UserService.principal.isAuthorized(requiredAccessLevel)) {
                        event.preventDefault();

                        if (!UserService.principal.isAuthenticated()) {
                            console.log('preventing state change, because user is not authenticated, redirect to signin.content');
                            $rootScope.nextStateAfterLogin = {toState: toState, toParams: toParams};
                            $state.go('signin.content');
                        } else {
                            console.log('preventing state change, because user is not authorized for: ' + requiredAccessLevel + ', has roles: '+  UserService.principal.getUser().roles);
                            $rootScope.$emit('clientmsg:error', 'user is not authorized for: ' + requiredAccessLevel + ', has roles: '+  UserService.principal.getUser().roles);
                        }

                    }
                } else {
                    // if the UserService is not done initializing we cancel the stateChange and schedule it again in 100ms
                    event.preventDefault();
                    console.log('preventing state change, because UserService not ready to check Authorization');
                    $timeout(function () {
                        $state.go(toState, toParams);
                    }, 100);
                }
            });

            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                console.debug('stateChangeSuccess from: ' + (fromState && fromState.name) + ' to: ' + toState.name);
                $analytics.pageTrack(toState.name);
            });

            // log stateChangeErrors
            $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {

                console.log('Error on StateChange from: "' + (fromState && fromState.name) + '" to:  "'+ toState.name + '", err:' + error.message + ", code_ " + error.status);

                if(error.status === 401) { // Unauthorized

                    $state.go('signin.content');

                } else if (error.status === 503) {
                    // the backend is down for maintenance, we stay on the page
                    // a message is shown to the user automatically by the error interceptor
                    event.preventDefault();
                } else {

                    $rootScope.$emit('clientmsg:error', error);
                    console.log('Stack: ' + error.stack);

                    // check if we tried to go to a home state, then we cannot redirect again to the same
                    // homestate, because that would lead to a loop
                    if (toState.name === 'dcm.home' || toState.name === 'dhc.game' || toState.name === 'admin-home.content') {
                        $state.go('error');
                    } else {
                        if (toState.name.toUpperCase().indexOf('DCM') !== -1) {
                            return $state.go('dcm.home');
                        } else {
                            return $state.go('dhc.game', {view: ""});
                        }
                    }

                }

            });

        }]);

