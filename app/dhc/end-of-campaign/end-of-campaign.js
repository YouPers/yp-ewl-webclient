(function () {
    'use strict';

    angular.module('yp.dhc')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('dhc.end-of-campaign', {
                        url: "/end",
                        access: accessLevels.user,
                        views: {
                            content: {
                                templateUrl: 'dhc/end-of-campaign/end-of-campaign.html',
                                controller: 'DhcEndOfCampaignController as endOfCampaignController'
                            }
                        },
                        resolve: {

                            jsInclude: ["util", function (util) {
                                return util.loadJSIncludes(['lib/d3/d3.min.js', 'lib/nvd3/nv.d3.min.js']);
                            }],

                            assessmentResult: ['AssessmentService', 'UserService', '$q', function (AssessmentService, UserService, $q) {
                                var currentUsersCampaign = UserService.principal.getUser().campaign;
                                if (!currentUsersCampaign) {
                                    return $q.reject('User is not part of a camapaign, Assessment only possible when user is part of a camapgin');
                                }
                                return AssessmentService.getNewestAssessmentResults(currentUsersCampaign.topic.id || currentUsersCampaign.topic);
                            }],
                            assessment: ['AssessmentService', 'UserService', '$q', function (AssessmentService, UserService, $q) {
                                var currentUsersCampaign = UserService.principal.getUser().campaign;
                                if (!currentUsersCampaign) {
                                    return $q.reject('User is not part of a camapaign, Assessment only possible when user is part of a camapgin');
                                }
                                return AssessmentService.getAssessment(currentUsersCampaign.topic.id || currentUsersCampaign.topic);
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/end-of-campaign/end-of-campaign');
            }])

        .controller('DhcEndOfCampaignController', ['$scope', '$q', '$translate', 'UserService', 'StatsService',
            'assessmentResult', 'assessment', 'campaign',
            function ($scope, $q, $translate, UserService, StatsService, assessmentResult, assessment, campaign) {

                $scope.healthCoachEvent = moment().isAfter(campaign.end) ? 'ended' : 'endingsoon';
                var user = UserService.principal.getUser();
                $scope.campaign = campaign;
                $scope.daysLeft = -moment().diff($scope.campaign.end, 'days');
                $scope.campaignEnding = $scope.daysLeft < 2;
                $scope.campaignEnded = moment().diff($scope.campaign.end) > 0;

                $scope.percetageFn = function (value) {
                    return Math.round(value *100) + '%';
                };

                init();

                function init() {

                    function _findByStatus(results, type, status) {
                        var res = results[0][type];
                        return (_.find(res, { status: status}) || {}).count;
                    }


                    $q.all([

                        StatsService.loadStats($scope.campaign.id,
                            {
                                type: 'eventsStatus',
                                scopeType: 'owner',
                                scopeId: user.id
                            }).then(function (results) {
                                var type = 'eventsStatus';
                                return {
                                    "key": $translate.instant('end-of-campaign.eventsStatus.user'),
                                    "values": [
                                        [$translate.instant('end-of-campaign.eventsStatus.done'), _findByStatus(results, type, 'done')],
                                        [$translate.instant('end-of-campaign.eventsStatus.missed'), _findByStatus(results, type, 'missed')],
                                        [$translate.instant('end-of-campaign.eventsStatus.open'), _findByStatus(results, type, 'open')]]
                                };

                            }),

                        StatsService.loadStats($scope.campaign.id,
                            {
                                type: 'eventsStatusAvg',
                                scopeType: 'campaign',
                                scopeId: campaign.id
                            }).then(function (results) {
                                var type = 'eventsStatusAvg';
                                return {
                                    "key": $translate.instant('end-of-campaign.eventsStatus.campaign'),
                                    "values": [
                                        [$translate.instant('end-of-campaign.eventsStatus.done'), _findByStatus(results, type, 'done')],
                                        [$translate.instant('end-of-campaign.eventsStatus.missed'), _findByStatus(results, type, 'missed')],
                                        [$translate.instant('end-of-campaign.eventsStatus.open'), _findByStatus(results, type, 'open')]]
                                };

                            })

                    ]).then(function (results) {
                        $scope.eventStatus = results;
                    });

                    // eventsRatings

                    $q.all([
                        StatsService.getRatingsStats('owner', user.id),
                        StatsService.getRatingsStats('campaign', $scope.campaign.id)
                    ]).then(function (results) {
                        $scope.eventsRatings = results;
                    });
                }


                // needForAction

                $q.all([

                    StatsService.loadStats($scope.campaign.id,
                        {
                            type: 'needForAction',
                            scopeType: 'owner',
                            scopeId: user.id
                        }).then(function (results) {

                            return results[0].needForAction;
                        }),

                    StatsService.loadStats($scope.campaign.id,
                        {
                            type: 'needForAction',
                            scopeType: 'campaign',
                            scopeId: campaign.id
                        }).then(function (results) {

                            return results[0].needForAction;
                        })

                ]).then(function (results) {
                    var needForAction = results[0];
                    var needForActionCampaign = results[1];

                    _.each(needForAction, function (need) {
                        need.campaignAvg = ( _.find(needForActionCampaign, {category: need.category}) || {}).avg;
                    });
                    $scope.needForAction = needForAction;
                });

                $scope.needForActionClass = function (value) {

                    var level = !value || value < 1 ? "none" :
                        value < 4 ? "low" :
                            value < 7 ? "medium" : "high";

                    var obj = {};
                    obj[level] = true;
                    return obj;
                };

                function needForActionPercentage(value) {
                    return Math.min(value * 2.6, 26) + '%';
                }
                $scope.needForActionStyle = function (value) {
                    return {
                        width: needForActionPercentage(value)
                    };
                };


            }
        ]);

}());