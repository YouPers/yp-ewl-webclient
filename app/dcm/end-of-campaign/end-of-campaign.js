(function () {
    'use strict';

    angular.module('yp.dcm')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('dcm.end-of-campaign', {
                        url: "/end",
                        access: accessLevels.user,
                        views: {
                            content: {
                                templateUrl: 'dcm/end-of-campaign/end-of-campaign.html',
                                controller: 'DcmEndOfCampaignController as endOfCampaignController'
                            }
                        },
                        resolve: {

                            jsInclude: ["util", function (util) {
                                return util.loadJSIncludes(['lib/d3/d3.min.js', 'lib/nvd3/nv.d3.min.js']);
                            }]

                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/end-of-campaign/end-of-campaign');
            }])

        .controller('DcmEndOfCampaignController', [ '$scope', '$q', '$translate', '$rootScope', 'UserService', 'StatsService', 'ActivityService', 'AssessmentService', 'campaign',
            function ($scope, $q, $translate, $rootScope, UserService, StatsService, ActivityService, AssessmentService, campaign) {

                $scope.campaign = campaign;
                $scope.daysLeft = - moment().diff($scope.campaign.end, 'days');
                $scope.campaignEnded = moment().diff($scope.campaign.end) > 0;

                $scope.percetageFn = function (value) {
                    return Math.round(value *100) + '%';
                };


                init();

                function init() {


                    StatsService.loadStats($scope.campaign.id,
                        {
                            type: 'usersTotal',
                            scopeType: 'campaign',
                            scopeId: $scope.campaign.id
                        }).then(function (results) {
                            var res = results[0].usersTotal;

                            $scope.campaignParticipants = [
                                {
                                    "key": $translate.instant('dcm-end-of-campaign.usersTotal.title'),
                                    "values": [ [ $translate.instant('dcm-end-of-campaign.usersTotal.title') , res.usersTotal]  ]
                                },
                                {
                                    "key": $translate.instant('dcm-end-of-campaign.usersTotal.title'),
                                    "values": [ [ $translate.instant('dcm-end-of-campaign.usersTotal.title') , res.usersAvg]  ]
                                }
                            ];

                        });



                    function findByStatus(results, type, status) {
                        var res = results[0][type];
                        return (_.find(res, { status: status}) || {}).count;
                    }
                    // eventsStatus / eventsStatusAvg
                    var eventStatus = [];
                    $q.all([


                        StatsService.loadStats($scope.campaign.id,
                            {
                                type: 'eventsStatusAvg',
                                scopeType: 'campaign',
                                scopeId: $scope.campaign.id
                            }).then(function (results) {
                                var type = 'eventsStatusAvg';
                                eventStatus.push({
                                    "key": $translate.instant('dcm-end-of-campaign.eventsStatus.campaign'),
                                    "values": [
                                        [$translate.instant('dcm-end-of-campaign.eventsStatus.done'), findByStatus(results, type, 'done')],
                                        [$translate.instant('dcm-end-of-campaign.eventsStatus.missed'), findByStatus(results, type, 'missed')],
                                        [$translate.instant('dcm-end-of-campaign.eventsStatus.open'), findByStatus(results, type, 'open')]]
                                });

                            }),
                        StatsService.loadStats($scope.campaign.id,
                            {
                                type: 'eventsStatusAvg'
                            }).then(function (results) {
                                var type = 'eventsStatusAvg';
                                eventStatus.push({
                                    "key": $translate.instant('dcm-end-of-campaign.eventsStatus.average'),
                                    "values": [
                                        [$translate.instant('dcm-end-of-campaign.eventsStatus.done'), findByStatus(results, type, 'done')],
                                        [$translate.instant('dcm-end-of-campaign.eventsStatus.missed'), findByStatus(results, type, 'missed')],
                                        [$translate.instant('dcm-end-of-campaign.eventsStatus.open'), findByStatus(results, type, 'open')]]
                                });

                            })

                    ]).then(function () {
                        $scope.eventStatus = eventStatus;
                    });

                    $q.all([
                        StatsService.getRatingsStats('campaign', $scope.campaign.id),
                        StatsService.getRatingsStats('all', $scope.campaign.id)
                    ]).then(function (results) {
                        $scope.eventsRatings = results;
                    });


                    // assessmentResults

                    $scope.displayInfo = function(question) {
                        $rootScope.$emit('healthCoach:displayMessage', AssessmentService.renderCoachMessageFromQuestion(question));
                    };

                    StatsService.loadStats($scope.campaign.id,
                        {
                            type: 'assessmentResults',
                            scopeType: 'campaign',
                            scopeId: $scope.campaign.id,
                            dontReplaceIds: 'true'
                        }).then(function (results) {
                            var type = 'assessmentResults';
                            var res = results[0][type];

                            $scope.assessmentResults = res;

                            $q.all(
                                [
                                    StatsService.loadStats($scope.campaign.id,
                                        {
                                            type: 'assessmentResults',
                                            scopeType: 'topic',
                                            scopeId: $scope.campaign.topic.id,
                                            dontReplaceIds: 'true'
                                        }).then(function (results) {
                                            var type = 'assessmentResults';
                                            var res = results[0][type];

                                            $scope.assessmentResultsAverage = res;

                                        }),
                                    AssessmentService.getAssessment(campaign.topic.id || campaign.topic).then(function (assessment) {

                                        $scope.categories = _.groupBy(assessment.questions, 'category');
                                        $scope.orderedCategoryNames = _.uniq(_.map(assessment.questions, 'category'));
                                        $scope.assessment = assessment;
                                    })
                                ])

                                .then(function () {

                                    $scope.assessmentResultStyle = function (val) {
                                        return { flex: '0 0 ' + val * 100 + '%' };
                                    };

                                    _.each($scope.assessmentResults.concat($scope.assessmentResultsAverage), function (result, index) {
                                        result.sum = result.veryNeg + result.neg + result.zero + result.pos + result.veryPos;
                                        var percentages = [
                                            result.veryNeg / result.sum,
                                            result.neg / result.sum,
                                            result.zero / result.sum,
                                            result.pos / result.sum,
                                            result.veryPos / result.sum
                                        ];
                                        result.percentages = [];
                                        _.each(percentages, function (val, index) {
                                            result.percentages.push(Math.floor(val * 100) / 100);
                                        });
                                    });

                                    // map assessment questions to stats questions
                                    $scope.assessmentResultsByQuestion = {};
                                    _.each($scope.assessmentResults, function (assessmentResult, index) {
                                        $scope.assessmentResultsByQuestion[assessmentResult.question] = assessmentResult;
                                    });
                                    $scope.assessmentResultsAverageByQuestion = {};
                                    _.each($scope.assessmentResultsAverage, function (assessmentResult, index) {
                                        $scope.assessmentResultsAverageByQuestion[assessmentResult.question] = assessmentResult;
                                    });
                                });


                        });

                    $scope.colorFn = function (d, i) {

                        var colors = ['#FF541E', '#FFD05C', '#20C63C', '#FFD05C', '#FF541E'];
                        return colors[i];
                    };
                    $scope.isCategoryEmpty = function (questions) {
                        return !_.any(questions, function (question) {
                            return $scope.assessmentResultsByQuestion[question.id];
                        });
                    };


                    // eventsPlanned, popular activities


                    StatsService.loadStats($scope.campaign.id,
                        {
                            type: 'eventsPlanned',
                            scopeType: 'campaign',
                            scopeId: $scope.campaign.id,
                            dontReplaceIds: 'true'
                        })
                        .then(function (results) {
                            var type = 'eventsPlanned';
                            var res = results[0][type];
                            _.each(res, function (event) {
                                event.idea = event._id;
                            });
                            return res;
                        })
                        .then(ActivityService.populateIdeas)
                        .then(function (res) {
                            $scope.eventsPlanned = res;
                        });

                }




            }
        ]);

}());