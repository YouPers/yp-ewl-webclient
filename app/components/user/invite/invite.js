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
                        url: "/invite/:invitingUserId/activity/:ideaId",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'components/user/invite/invite.html',
                                controller: 'InviteController'
                            }
                        },
                        resolve: {
                            idea: ['ActivityService', '$stateParams', function (ActivityService, $stateParams) {
                                return ActivityService.getIdea($stateParams.ideaId);
                            }],
                            invitingUser: ['UserService', '$stateParams', function (UserService, $stateParams) {
                                return UserService.getUser($stateParams.invitingUserId);
                            } ]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('components/user/invite/invite');
            }])

        .controller('InviteController', [ '$scope', '$rootScope', '$state', '$stateParams', 'UserService', 'idea', 'invitingUser',
            function ($scope, $rootScope, $state, $stateParams, UserService, idea, invitingUser) {


                $scope.onSignIn = function() {
                    $scope.$state.go('schedule.offer' , { id: idea.id });
                };

                // if the user is authenticated we immediatly go to the corresponding activity so he can join
                if ($scope.principal.isAuthenticated()) {
                    $scope.onSignIn();
                }

                $scope.offer = {
                    idea: idea,
                    recommendedBy: [invitingUser]
                };

                $scope.invitingUser = invitingUser;
                $scope.toggleSignUp = function() {
                    $scope.showSignUp = !$scope.showSignUp;
                };

            }
        ]);

}());