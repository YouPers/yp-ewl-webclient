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
                            topStressors: ['AssessmentService', 'UserService', '$q', function (AssessmentService, UserService, $q) {
                                var currentUsersCampaign = UserService.principal.getUser().campaign;
                                if (!currentUsersCampaign) {
                                    return $q.reject('User is not part of a camapaign, Assessment only possible when user is part of a camapgin');
                                }
                                return AssessmentService.topStressors(currentUsersCampaign.topic.id || currentUsersCampaign.topic);
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
            'assessmentResult', 'topStressors', 'assessment',
            function ($scope, $q, $translate, UserService, StatsService, assessmentResult, topStressors, assessment) {

                var user = UserService.principal.getUser();
                $scope.campaign = user.campaign;
                $scope.daysLeft = -moment().diff($scope.campaign.end, 'days');
                $scope.campaignEnded = moment().diff($scope.campaign.end) > 0;


                init();

                function init() {

                    function findByStatus(results, type, status) {
                        var res = results[0][type];
                        return (_.find(res, { status: status}) || {}).count;
                    }
                    function getCount(results, type) {
                        var res = results[0][type];
                        return res[0].count;
                    }

                    // eventsStatus / eventsStatusAvg
                    var eventStatus = [];
                    $q.all([

                        StatsService.loadStats($scope.campaign.id,
                            {
                                type: 'eventsStatus',
                                scopeType: 'owner',
                                scopeId: user.id
                            }).then(function (results) {
                                var type = 'eventsStatus';
                                eventStatus.push({
                                    "key": $translate.instant('end-of-campaign.eventsStatus.user'),
                                    "values": [
                                        [$translate.instant('end-of-campaign.eventsStatus.done'), findByStatus(results, type, 'done')],
                                        [$translate.instant('end-of-campaign.eventsStatus.missed'), findByStatus(results, type, 'missed')],
                                        [$translate.instant('end-of-campaign.eventsStatus.open'), findByStatus(results, type, 'open')]]
                                });

                            }),

                        StatsService.loadStats($scope.campaign.id,
                            {
                                type: 'eventsStatusAvg',
                                scopeType: 'campaign',
                                scopeId: user.campaign.id
                            }).then(function (results) {
                                var type = 'eventsStatusAvg';
                                eventStatus.push({
                                    "key": $translate.instant('end-of-campaign.eventsStatus.campaign'),
                                    "values": [
                                        [$translate.instant('end-of-campaign.eventsStatus.done'), findByStatus(results, type, 'done')],
                                        [$translate.instant('end-of-campaign.eventsStatus.missed'), findByStatus(results, type, 'missed')],
                                        [$translate.instant('end-of-campaign.eventsStatus.open'), findByStatus(results, type, 'open')]]
                                });

                            })

                    ]).then(function () {
                        $scope.eventStatus = eventStatus;
                    });

                    // eventsRatings
                    var eventsRatingsData = [
                        {
                            key: "eventRatings",
                            values: []
                        }
                    ];
                    $q.all([

                        StatsService.loadStats($scope.campaign.id,
                            {
                                type: 'eventsRatings',
                                scopeType: 'owner',
                                scopeId: user.id
                            }).then(function (results) {

                                console.log(results);

                                var type = 'eventsRatings';
                                eventsRatingsData[0].values.push(
                                    [$translate.instant('end-of-campaign.eventsRatings.user'), getCount(results, type)]
                                );

                            }),

                        StatsService.loadStats($scope.campaign.id,
                            {
                                type: 'eventsRatings',
                                scopeType: 'campaign',
                                scopeId: user.campaign.id
                            }).then(function (results) {

                                console.log(results);

                                var type = 'eventsRatings';
                                eventsRatingsData[0].values.push(
                                    [$translate.instant('end-of-campaign.eventsRatings.campaign'), getCount(results, type)]
                                );

                            })

                    ]).then(function () {
                        $scope.eventsRatingsData = eventsRatingsData;
                    });
                }


                $scope.eventsRatingsYAxisTickFormat = function (value) {
                    return value * 100 + '%';
                };

                $scope.eventFeedbackData = [
                    {
                        "key": "Deine Bewertungen",
                        "values": [['1', 0.2], ['3', 0.4], ['5', 0.1]]
                    },
                    {
                        "key": "Durschnitt der Kampagne",
                        "values": [['1', 0.4], ['3', 0.4], ['5', 0.2]]
                    }
                ];


                $scope.needForAction = assessmentResult ? assessmentResult.needForAction : null;
                $scope.categories = _.uniq(_.map(assessment.questions, 'category'));

                $scope.needForActionClass = function (category) {


                    var need = $scope.needForAction[category];

                    var level = !need || need < 1 ? "none" :
                        need < 4 ? "low" :
                            need < 7 ? "medium" : "high";

                    var obj = {};
                    obj[level] = true;
                    return obj;

                };

                $scope.needForActionStyle = function (category) {
                    return {
                        width: $scope.needForAction[category] * 10 * 0.6 + '%'
                    };
                };


            }
        ]);

}());