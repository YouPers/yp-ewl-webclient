(function () {
    'use strict';

    function _fillAndFormatStatsForCampaignDuration(sourceData, campaign, propsToPlot, runningTotal) {

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
        var nrOfValues = 0;

        var currentTotals = _.reduce(sourceData, function (sum, value) {
            for (var i = 0; i < propsToPlot.length; i++) {
                sum[i] = (sum[i] ||0) + value[propsToPlot[i]];
            }
            return sum;
        }, []);

        while (current.isAfter(startOfCampaign) && nrOfValues < 7) {
            var formattedCurrent = current.format('l');
            var values = [];
            for (var i = 0; i < propsToPlot.length; i++) {
                if (runningTotal) {
                    values.push(currentTotals[i]);
                    if (valuesByFormattedDate[formattedCurrent]) {
                        currentTotals[i] = currentTotals[i] - valuesByFormattedDate[formattedCurrent][propsToPlot[i]];
                    }
                } else {
                    values.push((valuesByFormattedDate[formattedCurrent] && valuesByFormattedDate[formattedCurrent][propsToPlot[i]]) || 0);
                }
            }
            myChartData.data.push({
                x: current.format('DD.MM.'),
                y: values});
            nrOfValues++;
            current.subtract(1, 'day');
        }
        return myChartData;
    }

    angular.module('yp.dcm')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('dcm.stats', {
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

                statsService.loadStats = function (campaignId, options) {
                    if (!options) {
                        options = {type: 'all', scopeType: 'campaign', scopeId: campaignId};
                    }
                    return Restangular.all('stats').getList(options);
                };

                statsService.fillAndFormatForPlot = _fillAndFormatStatsForCampaignDuration;

                return statsService;
            }])

        .controller('StatsController', [ '$scope', '$rootScope',  'StatsService', 'Restangular', 'campaign',
            function ($scope, $rootScope, StatsService, Restangular, campaign) {

                $scope.campaign = campaign;

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

                loadStats(campaign);



            }
        ]);


}());