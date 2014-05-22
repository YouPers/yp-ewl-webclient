(function () {
    'use strict';

    angular.module('yp.dcm')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('stats', {
                        templateUrl: "layout/dcm-default.html",
                        access: accessLevels.campaignlead
                    })
                    .state('stats.content', {
                        url: "/stats",
                        access: accessLevels.campaignlead,
                        views: {
                            content: {
                                templateUrl: 'dcm/stats/stats.html',
                                controller: 'StatsController'
                            }
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/stats/stats');
            }])

        .factory('StatsService', ['$http', 'Restangular', '$q', 'UserService', '$rootScope',
            function ($http, Restangular, $q, UserService, $rootScope) {
                var statsService = {};

                statsService.loadStats = function (campaignId) {
                    return Restangular.all('stats').getList({type:'all', scopeType:'campaign', scopeId:campaignId});
                };

                return statsService;
            }])

        .controller('StatsController', [ '$scope', '$rootScope', 'CampaignService', 'StatsService', 'Restangular',
            function ($scope, $rootScope, CampaignService, StatsService, Restangular) {

                function loadStats(campaign) {
                    if (!campaign) {
                        return;
                    }

                    StatsService.loadStats(campaign.id || campaign).then(function(stats) {
                        $scope.stats = Restangular.stripRestangular(stats[0]);
                    });
                }

                if (CampaignService.currentCampaign) {
                    loadStats(CampaignService.currentCampaign);
                }

                $scope.$watch(function () {
                    return CampaignService.currentCampaign;
                }, function (newValue) {
                    loadStats(newValue);
                });


            }
        ]);


}());