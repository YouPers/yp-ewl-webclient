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

                var user = UserService.principal.getUser();
                $scope.campaign = campaign;
                $scope.daysLeft = -moment().diff($scope.campaign.end, 'days');
                $scope.campaignEnding = $scope.daysLeft < 2;
                $scope.campaignEnded = moment().diff($scope.campaign.end) > 0;

                $scope.percetageFn = function (value) {
                    return value * 100 + '%';
                };

                init();

                function init() {

                    function findByStatus(results, type, status) {
                        var res = results[0][type];
                        return (_.find(res, { status: status}) || {}).count;
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
                                scopeId: campaign.id
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
                    var eventsRatings = [];

                    function getRatingsCount(results, type, rating) {
                        return ( _.find(results[0][type], { rating: rating } ) || {} ).count  || 0;
                    }

                    $q.all([

                        StatsService.loadStats($scope.campaign.id,
                            {
                                type: 'eventsRatings',
                                scopeType: 'owner',
                                scopeId: user.id
                            }).then(function (results) {

                                var type = 'eventsRatings';

                                var ratings = {
                                    1: getRatingsCount(results, type, 1),
                                    3: getRatingsCount(results, type, 3),
                                    5: getRatingsCount(results, type, 5)
                                    //,
                                    //null: getRatingsCount(results, type, null)
                                };
                                var sum = _.reduce(ratings, function (result, num, key) {
                                    return result + num;
                                });
                                function ratingValue(rating, sum) {
                                    return [ $translate.instant('end-of-campaign.eventsRatings.' + rating), ratings[rating] / sum ];
                                }


                                eventsRatings.push({
                                    "key": $translate.instant('end-of-campaign.eventsRatings.campaign'),
                                    "values": [
                                        ratingValue(1, sum),
                                        ratingValue(3, sum),
                                        ratingValue(5, sum)
                                        //,
                                        //ratingValue(null, sum)
                                    ]
                                });

                            }),

                        StatsService.loadStats($scope.campaign.id,
                            {
                                type: 'eventsRatings',
                                scopeType: 'campaign',
                                scopeId: campaign.id
                            }).then(function (results) {

                                var type = 'eventsRatings';

                                var ratings = {
                                    1: getRatingsCount(results, type, 1),
                                    3: getRatingsCount(results, type, 3),
                                    5: getRatingsCount(results, type, 5)
                                    //,
                                    //null: getRatingsCount(results, type, null)
                                };
                                var sum = _.reduce(ratings, function (result, num, key) {
                                    return result + num;
                                });
                                function ratingValue(rating, sum) {
                                    return [ $translate.instant('end-of-campaign.eventsRatings.' + rating), ratings[rating] / sum ];
                                }
                                

                                eventsRatings.push({
                                    "key": $translate.instant('end-of-campaign.eventsRatings.campaign'),
                                    "values": [
                                        ratingValue(1, sum),
                                        ratingValue(3, sum),
                                        ratingValue(5, sum)
                                        //,
                                        //ratingValue(null, sum)
                                    ]
                                });

                            })

                    ]).then(function () {
                        $scope.eventsRatings = eventsRatings;
                    });
                }


                $scope.eventsRatingsYAxisTickFormat = function (value) {
                    return value * 100 + '%';
                };



                // needForAction

                $q.all([

                    StatsService.loadStats($scope.campaign.id,
                        {
                            type: 'needForAction',
                            scopeType: 'owner',
                            scopeId: user.id
                        }).then(function (results) {

                            return results[0].needForAction;
                        })
                    ,
                    StatsService.loadStats($scope.campaign.id,
                        {
                            type: 'needForAction',
                            scopeType: 'campaign',
                            scopeId: campaign.id
                        }).then(function (results) {

                            return results;
                        })

                ]).then(function (results) {

                    console.log(results);

                    $scope.needForAction = results[0];


                });

                $scope.needForActionClass = function (value) {

                    var level = !value || value < 1 ? "none" :
                        value < 4 ? "low" :
                            value < 7 ? "medium" : "high";

                    var obj = {};
                    obj[level] = true;
                    return obj;
                };

                $scope.needForActionStyle = function (value) {
                    return {
                        width: Math.min(value * 4, 40) + '%'
                    };
                };


            }
        ]);

}());