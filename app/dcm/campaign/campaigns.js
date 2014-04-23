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
                        access: accessLevels.campaignlead
                    })
                    .state('campaigns.content', {
                        url: "/campaigns",
                        access: accessLevels.campaignlead,
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
                        access: accessLevels.campaignlead
                    })
                    .state('campaign.content', {
                        url: "/campaigns/:id",
                        access: accessLevels.campaignlead,
                        views: {
                            content: {
                                templateUrl: 'dcm/campaign/campaign.html',
                                controller: 'CampaignController'
                            }
                        },
                        resolve: {
                            campaign: ['$stateParams', 'CampaignService', function($stateParams, CampaignService) {

                                if($stateParams.id) {
                                    return CampaignService.getCampaign($stateParams.id);
                                } else {
                                    return undefined;
                                }

                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/campaign/campaign');
            }])



        .controller('CampaignController', [ '$scope', '$state', 'CampaignService', 'campaign',
            function ($scope, $state, CampaignService, campaign) {

                $scope.dateOptions = {
                    'year-format': "'yy'",
                    'starting-day': 1
                };


                $scope.minDateStart = new Date(moment().hour(8).minutes(0).seconds(0));
                // we assume, that a campaign ideally lasts at least 6 weeks
                $scope.minDateEnd = new Date(moment().hour(17).minutes(0).seconds(0).add('week',6));

                if(campaign) {
                    $scope.campaign = campaign;
                } else {
                    $scope.campaign = {
                        start: $scope.minDateStart,
                        end: $scope.minDateEnd
                    };
                }

                $scope.inviteCampaignLead = function(emails,campaign) {
                    CampaignService.inviteCampaignLead(emails, campaign.id).then(function() {
                        $scope.invitationSent = true;
                    });
                };

                $scope.saveCampaign = function() {

                    var startDate = moment($scope.campaign.start);
                    var endDate = moment($scope.campaign.end);
                    if (startDate.diff(endDate) < 0) {

                        var onCampaignSaved = function(campaign) {
                            $state.go('campaigns.content');
                        };

                        if($scope.campaign.id) {
                            CampaignService.putCampaign($scope.campaign).then(onCampaignSaved);
                        } else {
                            CampaignService.postCampaign($scope.campaign).then(onCampaignSaved);
                        }

                    } else {
                        $rootScope.$emit('clientmsg:error', 'campaign.dateRange');
                    }
                };


            }
        ])

        .controller('CampaignsController', [ '$scope', 'campaigns',
            function ($scope, campaigns) {

                var now = new Date();

                var groupedCampaigns = _.groupBy(campaigns, function(campaign) {
                    return moment(campaign.end) > moment() ? "active" : "inactive";
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

            }
        ]);

}());