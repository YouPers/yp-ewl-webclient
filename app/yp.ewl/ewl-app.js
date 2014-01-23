'use strict';
/*global angular:true */
angular.module('ypconfig', [])
    .constant('ypconfig', {"backendUrl": "http://localhost:8000/api/v1"});

// Declare app level module which depends on filters, and services
angular.module('yp-ewl',
        [
            'restangular', 'ui.router', 'ui.bootstrap', 'ngCookies', 'i18n',
            'ypconfig', 'yp.commons',
            'yp.auth', 'yp.user', 'yp.user.profile',
            'yp.healthpromoter',
            'yp.ewl.assessment',
            'yp.topic',
            'yp.ewl.activity', 'yp.ewl.activity.chart', 'yp.ewl.activity.chart2', 'yp.ewl.activity.vchart',
            'yp.ewl.evaluate',
            'yp.discussion', 'yp.sociallog', 'yp.activitylog',
            'yp.ewl.stresslevel.gauge', 'yp.ewl.stresslevel.linechart',
            'd3', 'd3.dir-hbar', 'd3.dir-vbar', 'd3.gauge', 'd3.dir-line-chart'
        ]).

    config(['$stateProvider', '$urlRouterProvider', 'accessLevels', 'RestangularProvider', 'ypconfig',
        function ($stateProvider, $urlRouterProvider, accessLevels, RestangularProvider, ypconfig) {
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
                .state('cockpit', {
                    url: "/cockpit",
                    templateUrl: "yp.cockpit/cockpit.html",
                    access: accessLevels.individual
                });

            RestangularProvider.setBaseUrl(ypconfig && ypconfig.backendUrl || "");
        }])

/**
 * setup checking of access levels for logged in user.
 */
    .run(['$rootScope', '$state', '$stateParams', 'principal', 'yp.user.UserService',
        function ($rootScope, $state, $stateParams, principal, UserService) {

            // setup globally available objects on the top most scope, so all other controllers
            // do not have to inject them

            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
            $rootScope.principal = principal;

            // handle routing authentication
            $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {

                var requiredAccessLevel = toState.access;

                // check whether user is authorized to access the desired access-Level
                if (!(principal.isAuthorized(requiredAccessLevel))) {
                    event.preventDefault();
                    $rootScope.$broadcast('loginMessageShow', {toState: toState, toParams: toParams});
                }

            });

        }]).

    config(['$translateProvider', function ($translateProvider) {
        $translateProvider.preferredLanguage('de');
        $translateProvider.useCookieStorage();
    }])

/**
 * main controller, responsible for
 * - showing global user messages
 * - highlighting global menu option according to currently active state
 * - setting principal to the scope, so all other scopes inherit it
 */
    .controller('MainCtrl', ['$scope', '$timeout', '$log','yp.user.UserService','$modal',
        function ($scope, $timeout, $log, UserService, $modal) {


            var loginDialogOpen = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'yp.ewl/loginDialog.html',
                    controller: 'yp.user.DialogLoginRegisterCtrl',
                    backdrop: true,
                    resolve: {
                        registerShown: function() {
                            return $scope.registerShown;
                        }
                    }
                });

                modalInstance.result.then(function (result) {
                    if (result.login) {
                        UserService.login(UserService.encodeCredentials(result.login.username,
                            result.login.password),
                            result.login.keepMeLoggedIn);
                    } else if (result.newuser) {
                        UserService.submitNewUser(result.newuser, function () {
                            UserService.login(UserService.encodeCredentials(result.newuser.username, result.newuser.password));
                        });
                    } else {

                    }
                });
            };

            // handle Menu Highlighting
            $scope.isActive = function (viewLocation) {
                return ($scope.$state.current.name.indexOf(viewLocation) !== -1);
            };

            $scope.getTopMenu = function () {
                if ($scope.$state.current.url.indexOf('hp') !== -1) {
                    return 'healthpromoter';
                } else if ($scope.$state.current.url.indexOf('home') !== -1) {
                    return 'home';
                } else {
                    return 'individual';
                }
            };

            $scope.$on('globalUserMsg', function (event, msg, type, duration) {
                $scope.globalUserMsg = {
                    text: msg,
                    type: type,
                    duration: duration
                };
                if (duration) {
                    $timeout(function () {
                        $scope.globalUserMsg = null;
                    }, duration);
                }
            });

            $scope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
                var msg = 'error during state transition from ' + fromState.name + ' to ' + toState.name + ": " +
                    (error.data || error.message ||error.toString() || error.status || error);

                if (error && error.status === 404) {
                     msg = 'YouPers Server not reachable, please try again later, code: ' + error.status;
                }
                $scope.$broadcast('globalUserMsg',msg, 'danger');
                $log.error(msg);
            });

            $scope.$on('loginMessageShow', function (event, data) {
                $scope.registerShown = data.registration;
                loginDialogOpen();
                $scope.nextStateAfterLogin = data;
            });

            $scope.closeUserMsg = function () {
                $scope.globalUserMsg = null;
            };


        }])


    .controller('yp.user.DialogLoginRegisterCtrl', ['$scope', '$modalInstance', 'registerShown','yp.user.UserService',
        function ($scope, $modalInstance, registerShown, UserService) {

            $scope.registerShownInitially = registerShown;

            var result = {
                login: {
                    username: '',
                    password: ''
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

            $scope.gotoPasswordReset = function() {
                $modalInstance.dismiss();
                $scope.$state.go('requestPasswordReset');
            };

        }])
    .directive('uniqueUserField', ['yp.user.UserService', function(UserService) {
        return {
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {

                // onchange instead of onblur is nice, but we should not hit the server all the time
                var validate = function(value) {

                    var user = {};
                    user[attrs.name] = value; // currently only username and email are checked in the backend

                    if(!value) {
                        return;
                    }

                    _.throttle(function() {

                        // validate and use a "unique" postfix to have different error messages

                        UserService.validateUser(user, function (res) {
                            scope.registerform.$setValidity(attrs.name+"unique", true);
                        }, function(err) {
                            scope.registerform.$setValidity(attrs.name+"unique", false);
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

