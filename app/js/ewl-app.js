'use strict';
/*global angular:true */
angular.module('ypconfig', [])
    .constant('ypconfig', {"backendUrl": "http://localhost:8000/api/v1"});

// Declare app level module which depends on filters, and services
angular.module('yp-ewl', ['yp.ewl.assessment', 'yp.ewl.activity', 'yp.ewl.evaluate', 'yp.discussion', 'yp.sociallog', 'yp.activitylog',
        'yp.ewl.activity.chart', 'yp.ewl.activity.chart2', 'yp.ewl.activity.vchart', 'yp.ewl.stresslevel.gauge', 'yp.ewl.stresslevel.linechart', 'yp.health-management-process', 'd3.dir-health-management-process', 'd3', 'd3.dir-hbar', 'd3.dir-vbar', 'd3.gauge', 'd3.dir-line-chart', 'yp.topic', 'ui.router', 'ui.bootstrap',
        'ngCookies', 'i18n', 'yp.commons', 'yp.auth', 'yp.healthpromoter', 'restangular', 'ypconfig']).

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
                    templateUrl: "partials/home.html",
                    access: accessLevels.all
                })
                .state('cockpit', {
                    url: "/cockpit",
                    templateUrl: "partials/cockpit.html",
                    access: accessLevels.individual
                });

            RestangularProvider.setBaseUrl(ypconfig && ypconfig.backendUrl || "");
        }])

/**
 * setup checking of access levels for logged in user.
 */
    .run(['$rootScope', '$state', '$stateParams', 'principal', 'yp.user.UserService',
        function ($rootScope, $state, $stateParams, principal, UserService) {

            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;

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
    .controller('MainCtrl', ['$scope', '$timeout', 'principal', '$log',
        function ($scope, $timeout, principal, $log) {

            $scope.principal = principal;

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
                var msg = 'error during state transition from ' + fromState.name + ' to ' + toState.name + ": " + (error.data || error.message ||error.toString() || error);
                $scope.$broadcast('globalUserMsg',msg, 'danger');
                $log.error(msg);
            });

            $scope.closeUserMsg = function () {
                $scope.globalUserMsg = null;
            };


        }])

    .directive('myModal', [
        '$modal', '$state', function ($modal, $state) {

            // Link function
            //
            return function (scope, elem, attr) {
                var lastParams, lastState, modalInstance;

                /*
                 These will be populated when modal is shown, and be reset
                 when the modal dismisses.
                 */
                lastState = null;
                lastParams = null;
                modalInstance = null;


                scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                    var dismiss, m;

                    // Entering "detail" state...
                    //
                    if (toState.name.indexOf('modal') === 0) {

                        /*
                         If we get here from another "detail" page
                         Just let ui-router update ui-view!
                         */
                        if (fromState.name.indexOf('modal') === 0) {
                            return;
                        }


                        // we got here from another (non modal state),
                        // so we clean up the ui-modal in the div we might have added before.
                        elem.html = '';

                        lastState = fromState;
                        lastParams = fromParams;
                        modalInstance = $modal.open({
                            template: '<div ui-view="modal"></div>',
                            windowClass: 'editModal',
                            // create a controller and set the modalInstance to the scope,
                            // with this any child controller (e.g. the state controller can access the
                            // the modalInstance on its $scope to call dismiss(reason) or close(result)
                            controller: ['$scope','$modalInstance', function($scope, $modalInstance) {
                                $scope.$modalInstance = $modalInstance;
                            }]
                        });
                        dismiss = function () {
                            var p, s;

                            if (modalInstance) { // If not resetted yet
                                s = lastState;
                                p = lastParams;
                                modalInstance = lastState = lastParams = null; // Reset!
                                $state.go(s || 'home', p); // Do state transition
                            }
                        };

                        return modalInstance.result.then(dismiss, dismiss);

                        // Leaving the detail state...
                        //
                    } else if (fromState.name.indexOf('modal') === 0) {
                        if (modalInstance) { // If not resetted yet
                            m = modalInstance;
                            modalInstance = lastState = lastParams = null; // Reset!
                            m.dismiss();  // Do dismission
                        }
                    }
                });
            };
        }
    ]);

