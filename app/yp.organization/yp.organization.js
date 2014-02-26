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
                        onEnter:['$state','$stateParams','CampaignService', '$rootScope',
                            function($state, $stateParams, CampaignService, $rootScope) {
                                var campaignId = $stateParams.id;
                                var token = $stateParams.token;
                                CampaignService.assignCampaignLead(campaignId, token).then(function(data) {
                                    $rootScope.$emit('notification:success', 'campaign.lead');
                                    $state.go('campaign', {id: campaignId});
                                }, function(err) {
                                    $rootScope.$emit('notification:error', err);
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
                        $rootScope.$emit('notification:error', err);
                    });
                };

                // validate and store a updated campaign

                $scope.updateCampaign = function() {
                    var startDate = moment($scope.campaign.start);
                    var endDate = moment($scope.campaign.end);
                    if (startDate.diff(endDate) < 0) {
                        // start date is earlier than end date, so we try to create the campaign
                        CampaignService.putCampaign($scope.campaign);
                    } else {
                        $rootScope.$emit('notification:error', 'campaign.dateRange');
                    }
                };

                var getCampaignStats = function() {
                    if ($scope.campaign.id) {

                        $scope.campaignStats = {};

                        CampaignService.getCampaignStats($scope.campaign.id, 'assUpdatesTotal').then(function(result) {
                            $scope.campaignStats.assUpdatesTotal = result[0].updatesTotal;
                        });

                        CampaignService.getCampaignStats($scope.campaign.id, 'assTotals').then(function(result) {
                            $scope.campaignStats.assTotals = result[0].totalUsers;
                        });
                        CampaignService.getCampaignStats($scope.campaign.id, 'activitiesPlannedTotal').then(function(result) {
                            $scope.campaignStats.activitiesPlannedTotal = result[0].activitiesPlannedTotal;
                        });
                        CampaignService.getCampaignStats($scope.campaign.id, 'activityEventsTotal').then(function(result) {
                            $scope.campaignStats.activityEventsTotal = result[0].eventsTotal;
                        });
                        CampaignService.getCampaignStats($scope.campaign.id, 'usersTotal').then(function(result) {
                            $scope.campaignStats.usersTotal = result[0].usersTotal;
                        });
                    }
                };

                getCampaignStats();
            }
        ]);
}());
