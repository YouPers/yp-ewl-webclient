(function () {
    'use strict';

    angular.module('yp.dcm')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('dcm.ideas', {
                        url: "/ideas",
                        access: accessLevels.campaignlead,
                        views: {
                            content: {
                                templateUrl: 'components/idea/ideas.html',
                                controller: 'IdeasController as ideasController'
                            }
                        },
                        resolve: {
                            ideas: ['ActivityService', 'campaign', function (ActivityService, campaign) {
                                return ActivityService.getIdeas({campaign: campaign.id || campaign, topic: campaign.topic.id || campaign.topic}).then(function (ideas) {
                                    return _.sortBy(ideas, "title");
                                });
                            }]
                        }
                    })
                    .state('dcm.idea', {
                        url: "/ideas/:id",
                        access: accessLevels.campaignlead,
                        views: {
                            content: {
                                templateUrl: 'components/idea/idea.html',
                                controller: 'IdeaController as ideaController'
                            }
                        },
                        resolve: {
                            idea: ['$stateParams', 'ActivityService', 'CampaignService', function ($stateParams, ActivityService, CampaignService) {

                                if ($stateParams.id) {
                                    return ActivityService.getIdea($stateParams.id);
                                } else {

                                    return CampaignService.getCampaign($stateParams.campaignId).then(function (campaign) {

                                        return {
                                            source: "campaign",
                                            defaultfrequency: "once",
                                            "defaultexecutiontype": "group",
                                            "defaultvisibility": "campaign",
                                            "defaultduration": 60,
                                            topics: [campaign.topic.id],
                                            campaign: $stateParams.campaignId,
                                            number: "Custom"
                                        };
                                    });

                                }

                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/activity/activity');
            }]);




}());