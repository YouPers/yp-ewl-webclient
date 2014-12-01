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

        .controller('DcmEndOfCampaignController', [ '$scope', '$q', '$translate', 'UserService', 'StatsService', 'ActivityService', 'campaign',
            function ($scope, $q, $translate, UserService, StatsService, ActivityService, campaign) {

                $scope.campaign = campaign;
                $scope.daysLeft = - moment().diff($scope.campaign.end, 'days');
                $scope.campaignEnded = moment().diff($scope.campaign.end) > 0;

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
                    function getCount(results, type) {
                        var res = results[0][type];
                        return res[0].count;
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



                    // assessmentResults
                    var assessmentResults = [];

                    var campaignLabel = $translate.instant('dcm-end-of-campaign.assessmentResults.campaign');
                    var averageLabel = $translate.instant('dcm-end-of-campaign.assessmentResults.average');

                    var veryNeg = $translate.instant('dcm-end-of-campaign.assessmentResults.veryNeg');
                    var neg = $translate.instant('dcm-end-of-campaign.assessmentResults.neg');
                    var zero = $translate.instant('dcm-end-of-campaign.assessmentResults.zero');
                    var pos = $translate.instant('dcm-end-of-campaign.assessmentResults.pos');
                    var veryPos = $translate.instant('dcm-end-of-campaign.assessmentResults.veryPos');

                    StatsService.loadStats($scope.campaign.id,
                        {
                            type: 'assessmentResults',
                            scopeType: 'campaign',
                            scopeId: $scope.campaign.id
                        }).then(function (results) {
                            var type = 'assessmentResults';
                            var res = results[0][type];

                            _.each(res, function (assessmentResult) {
                                assessmentResults.push(
                                    {
                                        question: assessmentResult.question,
                                        result: [
                                            {
                                                "id": 'veryNeg',
                                                "key": veryNeg,
                                                "values": [ [ campaignLabel , assessmentResult.veryNeg] ] //, [ 'Vergleichswert' , 0.25]
                                            },
                                            {
                                                "id": 'neg',
                                                "key": neg,
                                                "values": [ [ campaignLabel , assessmentResult.neg] ]
                                            },
                                            {
                                                "id": 'zero',
                                                "key": zero,
                                                "values": [ [ campaignLabel , assessmentResult.zero] ]
                                            },
                                            {
                                                "id": 'pos',
                                                "key": pos,
                                                "values": [ [ campaignLabel , assessmentResult.pos] ]
                                            },
                                            {
                                                "id": 'veryPos',
                                                "key": veryPos,
                                                "values": [ [ campaignLabel , assessmentResult.veryPos] ]
                                            }
                                        ]
                                    }
                                );
                            });

                            StatsService.loadStats($scope.campaign.id,
                                {
                                    type: 'assessmentResults',
                                    scopeType: 'topic',
                                    scopeId: $scope.campaign.topic.id
                                }).then(function (results) {
                                    var type = 'assessmentResults';
                                    var res = results[0][type];

                                    _.each(res, function (assessmentResultAverage) {

                                        var assessmentResult = _.find(assessmentResults, {question: assessmentResultAverage.question });
                                        _.each(assessmentResult.result, function (cat) {
                                            cat.values.push([averageLabel, assessmentResultAverage[cat.id]]);
                                        });
                                    });

                                    $scope.assessmentResults = assessmentResults;


                                });


                        });

                    $scope.colorFn = function (d, i) {

                        var colors = ['#FF541E', '#FFD05C', '#20C63C', '#FFD05C', '#FF541E'];
                        return colors[i];
                    };


                    // popular activities


                    StatsService.loadStats($scope.campaign.id,
                        {
                            type: 'activitiesPlanned',
                            scopeType: 'campaign',
                            scopeId: $scope.campaign.id,
                            dontReplaceIds: 'true'
                        })
                        .then(function (results) {
                            var type = 'activitiesPlanned';
                            var res = results[0][type];

                            return res;
                        })
                        .then(ActivityService.populateIdeas)
                        .then(function (res) {
                            $scope.activitiesPlanned = res;
                        });

                }




            }
        ]);

}());