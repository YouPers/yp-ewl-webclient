(function () {
    'use strict';


    angular.module('yp.cockpit',
            [
                'restangular', 'ui.router',

                'yp.assessment',

                'd3', 'd3.dir-hbar', 'd3.dir-vbar', 'd3.gauge', 'd3.dir-line-chart'
            ])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                //

                // Now set up the states
                $stateProvider

                    .state('cockpit', {
                        templateUrl: "yp.cockpit/yp.cockpit.html",
                        access: accessLevels.individual
                    })
                    .state('cockpit.default', {
                        url: "/cockpit",
                        access: accessLevels.individual,
                        views: {
                            first: {
                                templateUrl: 'yp.cockpit/yp.cockpit.stresslevel.html'
                            },
                            second: {
                                templateUrl: 'yp.cockpit/yp.cockpit.activityvchart.html',
                                controller: 'ActivityVChartController'
                            },
                            third: {
                                templateUrl: 'yp.cockpit/yp.cockpit.activitylog.html'
                            },
                            fourth: {
                                templateUrl: 'yp.cockpit/yp.cockpit.sociallog.html',
                                controller: 'SocialLogCtrl'
                            }
                        },
                        resolve: {
                            chart: ['ActivityChartService', function(ActivityChartService) {
                                return ActivityChartService.getActivityStats();
                            }],
                            socialLogEntries: ['SocialLogService', function(SocialLogService) {
                                return SocialLogService.getSocialLog();
                            }]
                        }
                    });


                $translateWtiPartialLoaderProvider.addPart('yp.cockpit');
            }]);


}());