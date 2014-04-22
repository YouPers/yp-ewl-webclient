(function () {
    'use strict';

    angular.module('yp.dcm.campaign',
        [
            'restangular',
            'ui.router'
        ])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('campaigns', {
                        templateUrl: "layout/default.html",
                        access: accessLevels.all
                    })
                    .state('campaigns.content', {
                        url: "/campaigns",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dcm/campaign/campaigns.html',
                                controller: 'CampaignsController'
                            }
                        },
                        resolve: {
                            campaigns: ['CampaignService', function(CampaignService) {
                                return CampaignService.getCampaigns();
                            }]
                        }
                    })
                    .state('campaign', {
                        templateUrl: "layout/default.html",
                        access: accessLevels.all
                    })
                    .state('campaign.content', {
                        url: "/campaigns/:id",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dcm/campaign/campaign.html',
                                controller: 'CampaignController'
                            }
                        },
                        resolve: {
                            campaign: ['$stateParams', 'CampaignService', function($stateParams, CampaignService) {
                                return CampaignService.getCampaign($stateParams.id);
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/campaign/campaign');
            }])



        .controller('CampaignsController', [ '$scope', 'CampaignService', 'campaign',
            function ($scope, CampaignService, campaign) {

                $scope.campaign = campaign;
            }
        ])

        .controller('CampaignsController', [ '$scope', 'campaigns',
            function ($scope, campaigns) {

                var now = new Date();

                var groupedCampaigns = _.groupBy(campaigns, function(campaign) {
                    return campaign.end < now ? "active" : "inactive";
                });


                var groups = [
                    'active',
                    'inactive'
                ];

                $scope.groups = [];

                _.forEach(groups, function (group) {
                    if(groupedCampaigns[group]) {

                        var campaigns = _.sortBy(groupedCampaigns[group], function(campaign) {
                            return campaign.start;
                        });

                        $scope.groups.push({
                            name: group,
                            campaigns: campaigns
                        });
                    }
                });

                $scope.updateCampaign = function() {

                    var startDate = moment($scope.campaign.start);
                    var endDate = moment($scope.campaign.end);
                    if (startDate.diff(endDate) < 0) {
                        CampaignService.putCampaign($scope.campaign).then(function() {
                            $state.go('campaigns.content');
                        });
                    } else {
                        $rootScope.$emit('clientmsg:error', 'campaign.dateRange');
                    }
                };
            }
        ]);

}());