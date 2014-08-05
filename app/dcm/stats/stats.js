(function () {
    'use strict';

    function _fillAndFormatStatsForCampaignDuration(sourceData, campaign, propsToPlot) {

        if (!propsToPlot) {
            propsToPlot = ['count'];
        }

        var emptyChartStat = {
            "series": propsToPlot,
            "data": [ ]
        };
        var valuesByFormattedDate = _.indexBy(sourceData, function (update) {
            return moment(new Date(Date.UTC(update.date.year, update.date.month - 1, update.date.day))).format("l");
        });

        var myChartData = _.clone(emptyChartStat);

        // initialize with 0-values from start of Campaign until today
        var current = moment().startOf('day');
        // use the start a bit before the start date, so the isAfter in the loop catches the first day of the campaign.
        var startOfCampaign = moment(campaign.start).startOf('day').subtract(1, 'hour');

        while (current.isAfter(startOfCampaign)) {
            var formattedCurrent = current.format('l');

            var values = [];
            for (var i = 0; i < propsToPlot.length; i++) {
                values.push((valuesByFormattedDate[formattedCurrent] && valuesByFormattedDate[formattedCurrent][propsToPlot[i]]) || 0);
            }
            myChartData.data.push({
                x: formattedCurrent,
                y: values});

            current.subtract(1, 'day');
        }
        return myChartData;
    }

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
                            jsInclude: ["util", function (util) {
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
                    return Restangular.all('stats').getList({type: 'all', scopeType: 'campaign', scopeId: campaignId});
                };

                return statsService;
            }])

        .controller('StatsController', [ '$scope', '$rootScope', 'CampaignService', 'StatsService', 'Restangular',
            function ($scope, $rootScope, CampaignService, StatsService, Restangular) {

                function loadStats(campaign) {
                    if (!campaign) {
                        return;
                    }

                    StatsService.loadStats(campaign.id || campaign).then(function (stats) {
                        $scope.stats = Restangular.stripRestangular(stats[0]);

                        // convert stats for charts
                        $scope.chartStats = {};

                        //////////////
                        // assUpdatesPerDay
                        $scope.chartStats.assUpdatesPerDay = _fillAndFormatStatsForCampaignDuration($scope.stats.assUpdatesPerDay, campaign);
                        $scope.chartStats.activitiesPlannedPerDay = _fillAndFormatStatsForCampaignDuration($scope.stats.activitiesPlannedPerDay, campaign);
                        $scope.chartStats.eventsDonePerDay = _fillAndFormatStatsForCampaignDuration($scope.stats.eventsDonePerDay, campaign, ['Done', 'Missed']);

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