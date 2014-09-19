'use strict';
/*global angular:true */


// Declare app level module which depends on filters, and services
angular.module('yp-ewl',
        [
            'restangular', 'ui.router', 'ui.bootstrap',  'ngAnimate', 'ipCookie',
            'angulartics','angulartics.google.analytics',

            'yp.config',

            'yp.components',


            'yp.admin',
            'yp.dhc',
            'yp.dcm',


            'templates-main'

        ]).

    config(['$stateProvider', '$urlRouterProvider', 'accessLevels', 'RestangularProvider', 'yp.config','$translateProvider', '$translateWtiPartialLoaderProvider',
        function ($stateProvider, $urlRouterProvider, accessLevels, RestangularProvider, config, $translateProvider, $translateWtiPartialLoaderProvider) {

            // For any unmatched url, send to /home
            $urlRouterProvider.otherwise('/dispatch');

            // Now set up the states
            $stateProvider
                .state('homedispatcher', {
                    url: "/dispatch",
                    access: accessLevels.all,
                    controller: ['UserService', '$state', function (UserService, $state) {
                        if (!UserService.principal.isAuthenticated()) {
                            return $state.go('signin.content');
                        } else if (UserService.principal.isAuthorized(accessLevels.campaignlead) || UserService.principal.isAuthorized(accessLevels.orgadmin)) {
                            return $state.go('dcm.home');
                        } else {
                            return $state.go('dhc.game');
                        }
                    }]
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

            $translateProvider.preferredLanguage('de');
            $translateProvider.addInterpolation('$translateMessageFormatInterpolation');
            $translateProvider.useCookieStorage();
            $translateProvider.useLoader('$translateWtiPartialLoader', {
                urlTemplate: '/{part}.translations.{lang}.json',
                wtiProjectId: '8233-eWL',
                wtiPublicApiToken: '8lfoHUymg_X8XETa_uLaHg',
                fromWti: config.translationSource === 'wti'
            });
            $translateWtiPartialLoaderProvider.addPart('yp.ewl/yp.ewl');
        }])

/**
 * setup checking of access levels for logged in user.
 */
    .run(['$rootScope', '$state', '$stateParams', '$window', 'UserService', '$timeout', '$http', '$translate', 'yp.config', '$analytics',
        function ($rootScope, $state, $stateParams, $window, UserService, $timeout, $http, $translate, config, $analytics) {

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

            // TODO: goto proper history entry instead of forwarding to a new location

            $rootScope.back = function() {
                if (!$state.current.previous ||
                    !$state.current.previous.name ||
                    $state.current.previous.name === 'invite.content') {

                    $state.go('home.content');

                } else if($state.current.previous.name.indexOf('schedule') >= 0) {
                    $state.go('select.content');
                } else {
                    $state.go($state.current.previous.name);
                }
            };


            // set the language to use for backend calls to be equal to the current GUI language
            // translate.use() returns undefined until the partial async loader has found the "proposedLanguage"
            // therefore we use in this case $translate.proposedLanguage()
            var localeToUse = $translate.use() || $translate.proposedLanguage();
            $http.defaults.headers.common['yp-language'] =  localeToUse;

            $translate.refresh();
            moment.locale(localeToUse);
            $rootScope.currentLocale=localeToUse;

            // handle routing authentication
            $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
                toState.previous = fromState;

                var requiredAccessLevel = toState.access;

                if (UserService.initialized) {
                    if (!UserService.principal.isAuthorized(requiredAccessLevel)) {
                        event.preventDefault();

                        if (!UserService.principal.isAuthenticated()) {
                            console.log('preventing state change, because user is not authenticated');
                            $rootScope.$broadcast('loginMessageShow', {toState: toState, toParams: toParams});
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

                $analytics.pageTrack(toState.name);

            });

            $rootScope.$on('loginMessageShow', function (event, data) {
                $state.go('signup.content');
                $rootScope.nextStateAfterLogin = data;
            });

            // log stateChangeErrors
            $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {

                console.log('Error on StateChange: '+ error.message);

                if(error.status === 401) { // Unauthorized

                    $state.go('signin.content');

                } else {

                    $rootScope.$emit('clientmsg:error', error);

                    console.log('Stack: ' + error.stack);
                    if (toState.name.toUpperCase().indexOf('DCM') !== -1) {
                        $state.go('dcm.home');
                    } else {
                        $state.go('dhc.game');
                    }
                }

            });

        }]);

