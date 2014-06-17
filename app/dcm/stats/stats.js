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
                        },
                        resolve: {
                            jsInclude: ["util", function(util) {
                                return util.loadJSInclude('lib/d3/d3.js');
                            }]
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

                        // convert stats for charts

                        $scope.chartStats = {};
                        var emptyChartStat = {
                            "series": [
                                "" // legend
                            ],
                            "data": [ ]
                        };

                        // assUpdatesPerDay

                        $scope.chartStats.assUpdatesPerDay = _.clone(emptyChartStat);
                        _.forEach($scope.stats.assUpdatesPerDay, function(update) {
                            $scope.chartStats.assUpdatesPerDay.data.push({
                                "x": moment(new Date(update.date.year, update.date.month, update.date.day)).format("l"),
                                "y": [ update.updatesPerDay ]
                            });
                        });

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