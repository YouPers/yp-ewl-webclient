(function () {
    'use strict';

    angular.module('yp.dhc')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('test-mail', {
                        url: "/testMail",
                        access: accessLevels.user,
                        templateUrl: 'dhc/test-mail/test-mail.html',
                        controller: 'TestMailController as testMailController',

                        resolve: {
                            campaign: ['$stateParams', 'UserService', 'CampaignService', function ($stateParams, UserService, CampaignService) {
                                return CampaignService.getCampaign(UserService.principal.getUser().campaign.id);
                            }]
                        }
                    });
            }])

        .controller('TestMailController', [ '$scope', '$rootScope','$interval', '$sce', '$window', 'UserService', 'TestMailService', 'campaign',
            function ($scope, $rootScope, $interval, $sce, $window, UserService, TestMailService, campaign) {

                var user = UserService.principal.getUser();

                $scope.mailTypes = ['dailySummaryMail', 'campaignLeadSummaryMail'];

                $scope.mailType = 'campaignLeadSummaryMail';


                $scope.sendMail = function (options) {

                    if($scope.mailType === 'campaignLeadSummaryMail' && !$scope.isOrdinalDate($scope.options.currentDate)) {
                        $window.alert('campaignLeadSummaryMail will NOT be sent by the backend for the current date');
                    }

                    TestMailService.sendMail($scope.mailType, options).then(function () {
                        $rootScope.$emit('clientmsg:success', 'testMail.sent');
                    });
                };


                $scope.setCurrentDate = function (date) {
                    $scope.options.currentDate = moment(date).toDate();
                };

                $scope.options = {};

                // dailySummaryMail
                (function initDailySummaryMail() {
                    $scope.campaign = campaign;
                    $scope.lastSummaryMail = user.lastSummaryMail;
                    $scope.options.currentDate = moment().toDate();
                    $scope.options.lastSentMailDate = $scope.lastSummaryMail ? moment($scope.lastSummaryMail).toDate() :
                        moment($scope.options.currentDate).subtract(1, 'days').toDate();

                    var midtermWeek = Math.floor(moment(user.campaign.end).diff(user.campaign.start, 'weeks') / 2);
                    _.extend($scope.campaign, {
                        midtermWeek: midtermWeek,
                        firstMonday: moment(campaign.start).day(1).add(1, 'weeks'),
                        midtermMonday: moment(campaign.start).day(1).add(midtermWeek, 'weeks'),
                        lastMonday: moment(user.campaign.end).day(1)
                    });
                })();

                // campaignLeadSummaryMail
                (function initCampaignLeadSummaryMail() {
                    $scope.ordinalDate = function (ordinalNumber) {
                        return moment(campaign.start).businessAdd(1 + ordinalNumber * 5).toDate();
                    };
                    $scope.isOrdinalDate = function (date) {
                        return moment(campaign.start).businessAdd(1).businessDiff(date) % 5 === 0;
                    };
                })();


                function refresh() {
                    $scope.refreshing = true;
                    TestMailService.getMail($scope.mailType, $scope.options).then(function (result) {
                        $scope.renderedMail = $sce.trustAsHtml(result);
                        $scope.refreshing = false;
                    }, function (err) {
                        $scope.error = err;
                        //$interval.cancel(promise);
                        $scope.refreshing = false;
                    });
                }
                refresh();
                $scope.refresh = refresh;
                //var promise = $interval(refresh, 10000);

                $scope.$watch('mailType', refresh);
                $scope.$watch('options', refresh, true);

            }
        ]);

}());