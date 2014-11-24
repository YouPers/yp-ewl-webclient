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
                            campaign: ['$stateParams', 'UserService', 'CampaignService', function ($stateParams, UserService, CampaignService) {
                                return CampaignService.getCampaign(UserService.principal.getUser().campaign.id);
                            }]
                        }
                    });
            }])

        .controller('DailySummaryController', [ '$scope', '$interval', '$sce', 'UserService', 'DailySummaryService', 'campaign',
            function ($scope, $interval, $sce, UserService, DailySummaryService, campaign) {

                var user = UserService.principal.getUser();


                $scope.sendSummaryMail = DailySummaryService.sendDailySummary;

                $scope.options = {};

                $scope.campaign = campaign;
                $scope.lastSummaryMail = user.lastSummaryMail;

                $scope.options.rangeEnd = moment().toDate();
                $scope.options.rangeStart = $scope.lastSummaryMail ? moment($scope.lastSummaryMail).toDate() :
                    moment($scope.options.rangeEnd).subtract(1, 'days').toDate();


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

                $scope.setRangeEnd = function (date) {
                    $scope.options.rangeEnd = moment(date).toDate();
                };
                var midtermWeek = Math.floor(moment(user.campaign.end).diff(user.campaign.start, 'weeks') / 2);
                _.extend($scope.campaign, {
                    midtermWeek: midtermWeek,
                    firstMonday: moment(campaign.start).day(1).add(1, 'weeks'),
                    midtermMonday: moment(campaign.start).day(1).add(midtermWeek, 'weeks'),
                    lastMonday: moment(user.campaign.end).day(1)
                });
            }
        ]);

}());