'use strict';
/*global angular:true */


// Declare app level module which depends on filters, and services
angular.module('yp-ewl',
        [
            'restangular', 'ui.router', 'ui.bootstrap', 'ngCookies', 'i18n', 'ngAnimate',
            'angulartics','angulartics.google.analytics',
            'yp.config', 'yp.commons', 'yp.clientmsg', 'yp.error',

            'yp.dhc',

            'yp.user.signin',
            'yp.user.signup',

            'yp.user', 'yp.payment',

            'yp.topic',
            'yp.assessment',
            'yp.activity',
            'yp.cockpit',
            'yp.evaluate',

            'yp.organization',
            'yp.discussion',
            'yp.feedback'

        ]).

    config(['$stateProvider', '$urlRouterProvider', 'accessLevels', 'RestangularProvider', 'yp.config','$translateProvider', '$translateWtiPartialLoaderProvider',
        function ($stateProvider, $urlRouterProvider, accessLevels, RestangularProvider, config, $translateProvider, $translateWtiPartialLoaderProvider) {
            //
            // For any unmatched url, send to /home
            $urlRouterProvider.otherwise("/home");
            //
            // Now set up the states
            $stateProvider
//                .state('home', {
//                    url: "/home",
//                    templateUrl: "yp.ewl/home.html",
//                    access: accessLevels.all
//                })
                .state('terms', {
                    url: "/terms",
                    templateUrl: "yp.ewl/terms.html",
                    access: accessLevels.all
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
            $translateWtiPartialLoaderProvider.addPart('yp.commons/yp.commons');
        }])

/**
 * setup checking of access levels for logged in user.
 */
    .run(['$rootScope', '$state', '$stateParams', '$window', 'UserService', '$timeout', '$http', '$translate', 'enums', 'yp.config',
        function ($rootScope, $state, $stateParams, $window, UserService, $timeout, $http, $translate, enums, config) {

            // setup globally available objects on the top most scope, so all other controllers
            // do not have to inject them

            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
            $rootScope.principal = UserService.principal;
            $rootScope.currentLocale = $translate.use() || $translate.proposedLanguage();
            $rootScope.enums = enums;
            $rootScope.config = config;


            // TODO: goto proper history entry instead of forwarding to a new location

            $rootScope.back = function() {
                if (!$state.current.previous || !$state.current.previous.name) {
                    $state.go('home.content');
                } else if($state.current.previous.name.indexOf('schedule' >= 0)) {
                    $state.go('select.content');
                } else {
                    $state.go($state.current.previous.name);
                }
            };


            // set the language to use for backend calls to be equal to the current GUI language
            // translate.use() returns undefined until the partial async loader has found the "proposedLanguage"
            // therefore we use in this case $translate.proposedLanguage()
            $http.defaults.headers.common['yp-language'] =  $translate.use() || $translate.proposedLanguage();

            $translate.refresh();

            // handle routing authentication
            $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
                toState.previous = fromState;

                var requiredAccessLevel = toState.access;

                if (UserService.initialized) {
                    if (!(UserService.principal.isAuthorized(requiredAccessLevel))) {
                        event.preventDefault();
                        console.log('preventing state change, because user is not authorized');
                        $rootScope.$broadcast('loginMessageShow', {toState: toState, toParams: toParams});
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

            // log stateChangeErrors
            $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
                console.log('Error on StateChange: '+ JSON.stringify(error));
            });

        }])


/**
 * main controller, responsible for
 * - showing global user messages
 * - highlighting global menu option according to currently active state
 * - setting principal to the scope, so all other scopes inherit it
 */
    .controller('MainCtrl', ['$scope', '$timeout', '$log', 'UserService', '$modal',
        function ($scope, $timeout, $log, UserService, $modal) {


            // handle Menu Highlighting
            $scope.isActive = function (viewLocation) {
                return ($scope.$state.current.name.indexOf(viewLocation) !== -1);
            };


            $scope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
                $scope.$emit('clientmsg:error', error);
            });

            $scope.$on('loginMessageShow', function (event, data) {
                $state.go('signin.content');
                $scope.nextStateAfterLogin = data;
            });

        }]);

