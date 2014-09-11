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
                        url: "/invite/:invitationId",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'components/user/invite/invite.html',
                                controller: 'InviteController'
                            }
                        },
                        resolve: {
                            invitation: ['SocialInteractionService', '$stateParams', function (SocialInteractionService, $stateParams) {
                                return SocialInteractionService.getSocialInteraction($stateParams.invitationId);
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('components/user/invite/invite');
            }])

        .controller('InviteController', [ '$scope', '$rootScope', '$state', '$stateParams', 'UserService', 'invitation',
            function ($scope, $rootScope, $state, $stateParams, UserService, invitation) {


                $scope.onSignIn = function() {
                    $scope.$state.go('dhc.activity' , { idea: activity.idea.id, socialInteraction: invitation.id });
                };

                // if the user is authenticated we immediatly go to the corresponding activity so he can join
                if ($scope.principal.isAuthenticated()) {
                    $scope.onSignIn();
                }

                $scope.idea = invitation.idea;

                $scope.invitingUser = invitation.author;
                $scope.toggleSignUp = function() {
                    $scope.showSignUp = !$scope.showSignUp;
                };

            }
        ]);

}());