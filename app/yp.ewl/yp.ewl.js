'use strict';
/*global angular:true */


// Declare app level module which depends on filters, and services
angular.module('yp-ewl',
        [
            'restangular', 'ui.router', 'ui.bootstrap', 'ngCookies', 'i18n',
            'yp.config', 'yp.commons', 'yp.notification', 'angulartics','angulartics.google.analytics',

            'yp.user',

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
                .state('home', {
                    url: "/home",
                    templateUrl: "yp.ewl/home.html",
                    access: accessLevels.all
                })
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
                urlTemplate: '/{part}/{part}.translations.{lang}.json',
                wtiProjectId: '8233-eWL',
                wtiPublicApiToken: '8lfoHUymg_X8XETa_uLaHg',
                fromWti: config.translationSource === 'wti'
            });
            $translateWtiPartialLoaderProvider.addPart('yp.ewl');
            $translateWtiPartialLoaderProvider.addPart('yp.commons');
        }])

/**
 * setup checking of access levels for logged in user.
 */
    .run(['$rootScope', '$state', '$stateParams', 'UserService', '$timeout', '$http', '$translate', 'enums', 'yp.config',
        function ($rootScope, $state, $stateParams, UserService, $timeout, $http, $translate, enums, config) {

            // setup globally available objects on the top most scope, so all other controllers
            // do not have to inject them

            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
            $rootScope.principal = UserService.principal;
            $rootScope.currentLocale = $translate.use() || $translate.proposedLanguage();
            $rootScope.enums = enums;
            $rootScope.config = config;

            // set the language to use for backend calls to be equal to the current GUI language
            // translate.use() returns undefined until the partial async loader has found the "proposedLanguage"
            // therefore we use in this case $translate.proposedLanguage()
            $http.defaults.headers.common['yp-language'] =  $translate.use() || $translate.proposedLanguage();

            $translate.refresh();

            // handle routing authentication
            $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {

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


            var loginDialogOpen = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'yp.ewl/loginDialog.html',
                    controller: 'yp.user.DialogLoginRegisterCtrl',
                    backdrop: true,
                    resolve: {
                        registerShown: function () {
                            return $scope.registerShown;
                        }
                    }
                });

                modalInstance.result.then(function (result) {
                    if (result.login) {
                        UserService.login(UserService.encodeCredentials(result.login.username, result.login.password),
                                result.login.keepMeLoggedIn).then(function(){
                                if ($scope.nextStateAfterLogin) {
                                    $scope.$state.go($scope.nextStateAfterLogin.toState, $scope.nextStateAfterLogin.toParams);
                                }
                            });
                    } else if (result.newuser) {
                        UserService.submitNewUser(result.newuser).then(function (newUser) {
                            UserService.login(UserService.encodeCredentials(result.newuser.username, result.newuser.password)).then(function() {
                                if ($scope.nextStateAfterLogin) {
                                    $scope.$state.go($scope.nextStateAfterLogin.toState, $scope.nextStateAfterLogin.toParams);
                                }
                            });
                        });
                    } else {
                        // user dismissed the dialog without result - we do nothing
                    }
                });
            };

            // handle Menu Highlighting
            $scope.isActive = function (viewLocation) {
                return ($scope.$state.current.name.indexOf(viewLocation) !== -1);
            };


            $scope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
                $scope.$emit('notification:error', error);
            });

            $scope.$on('loginMessageShow', function (event, data) {
                $scope.registerShown = data && data.registration;
                loginDialogOpen();
                $scope.nextStateAfterLogin = data;
            });

        }])


    .controller('yp.user.DialogLoginRegisterCtrl', ['$scope', '$modalInstance', 'registerShown', 'UserService',
        function ($scope, $modalInstance, registerShown, UserService) {

            $scope.registerShownInitially = registerShown;

            var result = {
                login: {
                    username: '',
                    password: '',
                    keepMeLoggedIn: true
                }
            };
            $scope.result = result;

            // passing in a reference to "registerform" and saving it on our scope
            // this is a workaround for current issue: https://github.com/angular-ui/bootstrap/issues/969
            $scope.showRegistrationForm = function (registerform) {
                $scope.registerShownInitially = false;
                delete result.login;
                result.newuser = {};
                $scope.registerShown = true;
                $scope.registerform = registerform;
            };

            $scope.$watchCollection('[result.newuser.firstname, result.newuser.lastname]', function () {
                if ($scope.registerform && !$scope.registerform.username.$dirty && $scope.result.newuser.firstname) {
                    $scope.result.newuser.username = ($scope.result.newuser.firstname.substr(0, 1) || '').toLowerCase() + ($scope.result.newuser.lastname || '').toLowerCase();
                }
            });

            $scope.cancel = function () {
                $modalInstance.dismiss();
            };

            $scope.done = function () {
                $modalInstance.close(result);
            };

            $scope.gotoPasswordReset = function () {
                $modalInstance.dismiss();
                $scope.$state.go('requestPasswordReset');
            };

        }])
    .directive('uniqueUserField', ['UserService', function (UserService) {
        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {

                // onchange instead of onblur is nice, but we should not hit the server all the time
                var validate = function (value) {

                    var user = {};
                    user[attrs.name] = value; // currently only username and email are checked in the backend

                    if (!value) {
                        return;
                    }

                    _.throttle(function () {

                        // validate and use a "unique" postfix to have different error messages

                        UserService.validateUser(user, function (res) {
                            ctrl.$setValidity("unique", true);
                        }, function (err) {
                            ctrl.$setValidity("unique", false);
                        });

                    }, 500)();


                    // we can't return undefined for invalid values as it is validated asynchronously
                    return value;
                };

                ctrl.$parsers.unshift(validate); // user input
                ctrl.$formatters.unshift(validate); // model change

            }
        };
    }]);

