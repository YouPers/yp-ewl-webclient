(function () {
    'use strict';

    angular.module('yp.dhc')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('daily-summary', {
                        url: "/dailySummary",
                        access: accessLevels.user,
                        templateUrl: 'dhc/daily-summary/daily-summary.html',
                        controller: 'DailySummaryController as dailySummaryController',

                        resolve: {

                        }
                    });
            }])

        .controller('DailySummaryController', [ '$scope', '$interval', '$sce', 'DailySummaryService',
            function ($scope, $interval, $sce, DailySummaryService) {

                function init() {
                    DailySummaryService.getDailySummary().then(function (result) {
                        $scope.dailySummary = $sce.trustAsHtml(result);
                    }, function (err) {
                        $scope.error = err;
                        //$interval.cancel(promise);
                    });
                }

                init();
                //var promise = $interval(init, 10000);
            }
        ]);

}());