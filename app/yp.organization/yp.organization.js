(function () {
    'use strict';


    angular.module('yp.organization', ['ui.router'])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {

                $stateProvider
                    .state('organization', {
                        url: '/organization',
                        templateUrl: 'yp.organization/yp.organization.create.html',
                        controller: 'CreateOrganizationController',
                        access: accessLevels.user
                    })
                    .state('campaign', {
                        url: '/campaign/{id}',
                        templateUrl: 'yp.organization/yp.campaign.html',
                        controller: 'CampaignController',
                        access: accessLevels.campaignlead,
                        resolve: {
                            campaign: ['CampaignService', '$stateParams', function(CampaignService, $stateParams) {
                                return CampaignService.getCampaign($stateParams.id);
                            }]
                        }
                    })

                    .state('assignCampaignLead', {
                        url: '/campaigns/{id}/becomeCampaignLead?token',
                        access: accessLevels.user,
                        onEnter:['$state','$stateParams','CampaignService', 'principal', '$rootScope',
                            function($state, $stateParams, CampaignService, principal, $rootScope) {
                            var campaignId = $stateParams.id;
                            var token = $stateParams.token;
                            CampaignService.assignCampaignLead(campaignId, token).then(function(data) {
                                $rootScope.$broadcast('globalUserMsg', 'You are now a Campaign Lead of this campaign', 'success', 5000);
                                $state.go('campaign', {id: campaignId});
                            }, function(err) {
                                $rootScope.$broadcast('globalUserMsg', 'error', 'danger');
                                console.log(JSON.stringify(err));
                                $state.go('home');
                            });
                        }]

                    });

                $translateWtiPartialLoaderProvider.addPart('yp.organization');
            }])

        .controller('CampaignController', ['campaign', 'CampaignService', '$scope', '$rootScope',
            function (campaign, CampaignService, $scope, $rootScope) {
                $scope.campaign = campaign;

                $scope.inviteCampaignLead = function(emails,campaign) {
                    CampaignService.inviteCampaignLead(emails, campaign.id).then(function() {
                        $scope.invitationSent = true;
                    }, function(err) {
                        $rootScope.$broadcast('globalUserMsg', 'Error sending invitation: '+ JSON.stringify(err), 'danger', 5000);
                    });
                };
            }
        ]);
}());
