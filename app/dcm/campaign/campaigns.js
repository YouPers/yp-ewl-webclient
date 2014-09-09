(function () {
    'use strict';

    angular.module('yp.dcm')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('dcm.campaigns', {
                        url: "/campaigns",
                        access: accessLevels.campaignlead,
                        views: {
                            content: {
                                templateUrl: 'dcm/campaign/campaigns.html',
                                controller: 'CampaignsController'
                            }
                        },
                        resolve: {
                            campaigns: ['CampaignService', function (CampaignService) {
                                return CampaignService.getCampaigns({populate: 'topic'});
                            }]
                        }
                    })
                    .state('dcm.campaign', {
                        url: "/edit",
                        access: accessLevels.campaignlead,
                        views: {
                            content: {
                                templateUrl: 'dcm/campaign/campaign.html',
                                controller: 'CampaignController'
                            }
                        },
                        resolve: {
                            campaign: ['$stateParams', 'CampaignService', function ($stateParams, CampaignService) {

                                if ($stateParams.campaignId) {
                                    return CampaignService.getCampaign($stateParams.campaignId);
                                } else {
                                    return undefined;
                                }

                            }],
                            topics: ['Restangular', function (Restangular) {
                                return Restangular.all('topics').getList();
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/campaign/campaign');
            }])


        .controller('CampaignController', [ '$scope', 'CampaignService', 'UserService', 'campaign', 'topics',
            function ($scope , CampaignService, UserService, campaign, topics) {

                $scope.dateOptions = {
                    'year-format': "'yy'",
                    'starting-day': 1
                };

                topics.byId = _.indexBy(topics, 'id');
                $scope.topics = topics;


                var start = new Date(moment().hour(8).minutes(0).seconds(0));
                var end = new Date(moment().hour(17).minutes(0).seconds(0).add(6, 'weeks'));

                if (campaign) {
                    $scope.campaign = campaign;
                } else {
                    $scope.campaign = {
                        title: '',
                        start: start,
                        end: end
                    };
                }

                $scope.$watch('campaign.topic', function (newTopic, oldTopic) {
                    if (newTopic) {
                        $scope.campaign.title = topics.byId[newTopic].name;
                        $scope.campaign.avatar = topics.byId[newTopic].picture;
                    }
                });

                $scope.inviteCampaignLead = function (emails, campaign) {
                    CampaignService.inviteCampaignLead(emails, campaign.id).then(function () {
                        $scope.invitationSent = true;
                    });
                };

                $scope.saveCampaign = function () {

                    var startDate = moment($scope.campaign.start);
                    var endDate = moment($scope.campaign.end);
                    if (startDate.diff(endDate) < 0) {

                        if ($scope.campaign.id) {
                            CampaignService.putCampaign($scope.campaign).then(function (campaign) {
                                $scope.$state.go('dcm.home');
                            });
                        } else {
                            CampaignService.postCampaign($scope.campaign)
                                .then(function (campaign) {
                                    $scope.campaign = campaign;

                                    return UserService.reload();
                                })
                                .then(function () {
                                    return $scope.$emit('clientmsg:success', 'campaign.saved');
                                });
                        }

                    } else {
                        $scope.$emit('clientmsg:error', 'campaign.dateRange');
                    }
                };


            }
        ])

        .controller('CampaignsController', [ '$scope', 'campaigns',
            function ($scope, campaigns) {

                var groupedCampaigns = _.groupBy(campaigns, function (campaign) {
                    return moment(campaign.end) > moment() ? "active" : "inactive";
                });


                var groups = [
                    'active',
                    'inactive'
                ];

                $scope.groups = [];

                _.forEach(groups, function (group) {
                    if (groupedCampaigns[group]) {

                        var campaigns = _.sortBy(groupedCampaigns[group], function (campaign) {
                            return campaign.start;
                        });

                        $scope.groups.push({
                            name: group,
                            campaigns: campaigns
                        });
                    }
                });

            }
        ])

        .directive('selectOnClick', function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    function selectElementContents(el) {
                        var range = document.createRange();
                        range.selectNodeContents(el[0]);
                        var sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }

                    element.on('click', function () {
                        selectElementContents(element);
                    });
                }
            };
        });


}());