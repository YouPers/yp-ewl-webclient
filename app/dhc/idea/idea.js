(function () {
    'use strict';

    angular.module('yp.dhc')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('dhc.ideas', {
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
                                return ActivityService.getIdeas({
                                    campaign: campaign.id || campaign,
                                    topic: campaign.topic.id || campaign.topic
                                }).then(function (ideas) {
                                    return _.sortBy(ideas, "title");
                                });
                            }]
                        }
                    })
                    .state('dhc.idea', {
                        url: "/ideas/:id",
                        access: accessLevels.campaignlead,
                        views: {
                            content: {
                                templateUrl: 'components/idea/idea.html',
                                controller: 'IdeaController as ideaController'
                            }
                        },
                        resolve: {
                            idea: ['$stateParams', 'ActivityService', 'CampaignService', 'UserService',
                                function ($stateParams, ActivityService, CampaignService, UserService) {

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
                                                number: "Custom",
                                                author: UserService.principal.getUser()
                                            };
                                        });

                                    }

                                }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/activity/activity');
            }]);


}());