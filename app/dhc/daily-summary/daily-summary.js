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

                $scope.options = {};

                $scope.options.rangeEnd = moment().toDate();
                $scope.options.rangeStart = moment($scope.options.rangeEnd).subtract(1, 'days').toDate();


                function refresh() {
                    $scope.refreshing = true;
                    DailySummaryService.getDailySummary($scope.options).then(function (result) {
                        $scope.dailySummary = $sce.trustAsHtml(result);
                        $scope.refreshing = false;
                    }, function (err) {
                        $scope.error = err;
                        $interval.cancel(promise);
                        $scope.refreshing = false;
                    });
                }

                refresh();
                var promise = $interval(refresh, 10000);

                $scope.$watch('options', function () {
                    refresh();
                }, true);
            }
        ]);

}());