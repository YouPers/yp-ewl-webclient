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
                            }],

                            onSignIn: ['$state', 'UserService', 'invitation', function ($state, UserService, invitation) {
                                var onSignIn = function() {
                                    $state.go('dhc.activity' , {
                                        campaignId: invitation.activity.campaign, //TODO: check if it is the same as the users campaign
                                        idea: invitation.activity.idea.id,
                                        activity: invitation.activity.id,
                                        socialInteraction: invitation.id
                                    });
                                };


                                // if the user is authenticated we immediatly go to the corresponding activity so he can join
                                if (UserService.principal.isAuthenticated()) {
                                    onSignIn();
                                } else {
                                    return onSignIn;
                                }

                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('components/user/invite/invite');
            }])

        .controller('InviteController', [ '$scope', '$rootScope', '$state', '$stateParams', 'UserService', 'invitation', 'onSignIn',
            function ($scope, $rootScope, $state, $stateParams, UserService, invitation, onSignIn) {


                $scope.onSignIn = onSignIn;

                $scope.idea = invitation.idea;

                $scope.invitingUser = invitation.author;
                $scope.toggleSignUp = function() {
                    $scope.showSignUp = !$scope.showSignUp;
                };

            }
        ]);

}());