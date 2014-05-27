(function () {
    'use strict';

    angular.module('yp.components.user')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('invite', {
                        templateUrl: "layout/single-column.html",
                        access: accessLevels.all
                    })
                    .state('invite.content', {
                        url: "/invite/:invitingUserId/activity/:activityId",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'components/user/invite/invite.html',
                                controller: 'InviteController'
                            }
                        },
                        resolve: {
                            activity: ['ActivityService', '$stateParams', function (ActivityService, $stateParams) {
                                return ActivityService.getActivity($stateParams.activityId);
                            }],
                            invitingUser: ['UserService', '$stateParams', function (UserService, $stateParams) {
                                return UserService.getUser($stateParams.invitingUserId);
                            } ]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('components/user/invite/invite');
            }])

        .controller('InviteController', [ '$scope', '$rootScope', '$state', '$stateParams', 'UserService', 'activity', 'invitingUser',
            function ($scope, $rootScope, $state, $stateParams, UserService, activity, invitingUser) {


                $scope.onSignIn = function() {
                    $scope.$state.go('schedule.offer' , { id: activity.id });
                };

                // if the user is authenticated we immediatly go to the corresponding activity so he can join
                if ($scope.principal.isAuthenticated()) {
                    $scope.onSignIn();
                }

                $scope.offer = {
                    activity: activity,
                    recommendedBy: [invitingUser]
                };

                $scope.invitingUser = invitingUser;
                $scope.toggleSignUp = function() {
                    $scope.showSignUp = !$scope.showSignUp;
                };

            }
        ]);

}());