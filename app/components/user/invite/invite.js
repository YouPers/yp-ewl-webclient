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
                        url: "/invite/:invitationId?invalidCampaign",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'components/user/invite/invite.html',
                                controller: 'InviteController as inviteController'
                            }
                        },
                        resolve: {
                            invitation: ['SocialInteractionService', '$stateParams', function (SocialInteractionService, $stateParams) {
                                return SocialInteractionService.getSocialInteraction($stateParams.invitationId);
                            }],

                            campaign: ['CampaignService', 'invitation', function (CampaignService, invitation) {
                                return CampaignService.getCampaign(invitation.activity.campaign);
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('components/user/invite/invite');
            }])

        .controller('InviteController', [ '$scope', '$rootScope', '$state', '$stateParams', 'UserService', 'invitation', 'campaign',
            function ($scope, $rootScope, $state, $stateParams, UserService, invitation, campaign) {

                var inviteController = this;

                // if the user is authenticated, display a continue button
                $scope.isAuthenticated = UserService.principal.isAuthenticated();

                if($scope.isAuthenticated) {

                    // check the users campaign against the campaign of the activity
                    // log him out if it does not match, and show a message

                    var user = UserService.principal.getUser();
                    if(!user.campaign) {
                        $rootScope.$emit('clientmsg:error', 'userWithoutcampaign');
                        return;
                    }

                    if(invitation.activity.campaign !== user.campaign.id) {
                        UserService.logout().then(function () {
                            $scope.isAuthenticated = false;
                            inviteController.invalidCampaignUser = user;
                        });
                    }

                }

                $scope.campaign = campaign;
                $scope.idea = invitation.idea;

                $scope.invitingUser = invitation.author;



                $scope.showActivity = function() {
                    $state.transitionTo('dhc.activity' , {
                        campaignId: invitation.activity.campaign, //TODO: check if it is the same as the users campaign
                        idea: invitation.activity.idea.id,
                        activity: invitation.activity.id,
                        socialInteraction: invitation.id
                    });
                };

            }
        ]);

}());