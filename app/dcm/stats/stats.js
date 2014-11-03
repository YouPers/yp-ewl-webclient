(function () {
    'use strict';

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
                                return util.loadJSInclude('lib/d3/d3.min.js');
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/stats/stats');
            }])

        .controller('StatsController', [ '$scope', '$rootScope',  'StatsService', 'Restangular', 'campaign',
            function ($scope, $rootScope, StatsService, Restangular, campaign) {

                $scope.campaign = campaign;

                init();

                function init() {
                    if (!campaign) {
                        return;
                    }

                    StatsService.loadStats(campaign.id || campaign).then(function (stats) {
                        $scope.stats = Restangular.stripRestangular(stats[0]);

                        // convert stats for charts
                        $scope.chartStats = {};

                        var options = {
                            runningTotal: false,
                            newestDay: moment.min(moment(), moment($scope.campaign.end)),
                            nrOfDaysToPlot: 14
                        };

                        //////////////
                        // format data for drawing a plot
                        $scope.chartStats.assUpdatesPerDay = StatsService.fillAndFormatForPlot($scope.stats.assUpdatesPerDay, options);

                        options = {
                            runningTotal: false,
                            newestDay: moment.min(moment(), moment($scope.campaign.end)),
                            nrOfDaysToPlot: 14
                        };

                        $scope.chartStats.activitiesPlannedPerDay = StatsService.fillAndFormatForPlot($scope.stats.activitiesPlannedPerDay, options);

                        options = {
                            runningTotal: false,
                            newestDay: moment.min(moment(), moment($scope.campaign.end)),
                            nrOfDaysToPlot: 14,
                            propsToPlot: ['Done', 'Missed']
                        };

                        $scope.chartStats.eventsDonePerDay = StatsService.fillAndFormatForPlot($scope.stats.eventsDonePerDay, options);

                    });
                }


            }
        ]);


}());