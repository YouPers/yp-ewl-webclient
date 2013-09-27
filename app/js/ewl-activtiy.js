'use strict';

angular.module('yp.ewl.activity', ['restangular', 'ui.router', 'yp.auth'])


    .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
        function ($stateProvider, $urlRouterProvider, accessLevels) {
            $stateProvider
                .state('activitylist', {
                    url: "/activities",
                    templateUrl: "partials/activity.list.html",
                    controller: "ActivityListCtrl",
                    access: accessLevels.all,
                    resolve: {
                        allActivities: ['ActivityService', function (ActivityService) {
                            return ActivityService.getActivities();
                        }],
                        plannedActivities: ['ActivityService', function (ActivityService) {
                            return ActivityService.getPlannedActivities();
                        }]
                    }
                })
                .state('activityDetail', {
                    url: "/activities/:activityId",
                    templateUrl: "partials/activity.detail.html",
                    controller: "ActivityCtrl",
                    access: accessLevels.individual,
                    abstract: true,
                    resolve: {
                        allActivities: ['ActivityService', function (ActivityService) {
                            return ActivityService.getActivities();
                        }],
                        plannedActivities: ['ActivityService', function (ActivityService) {
                            return ActivityService.getPlannedActivities();
                        }]
                    }
                })
                .state('activityDetail.self', {
                    url: "",
                    templateUrl: "partials/activity.detail.self.html",
                    controller: "ActivityCtrl",
                    access: accessLevels.individual
                })
                .state('activityDetail.group', {
                    url: "/group",
                    templateUrl: "partials/activity.detail.group.html",
                    controller: "ActivityCtrl",
                    access: accessLevels.individual
                });
        }])


    .factory('ActivityService', ['$http', 'Restangular', function ($http, Restangular) {

        /**
         function Activity(id, title, text, af, plCat) {
            this.id = id;
            this.title = title;
            this.text = text;
            this.field = af;
            this.planningCat = plCat;
        }
         */

        var activities = Restangular.all('activities');
        var plannedActivities = Restangular.all('activitiesPlanned');


        var actService = {
            getActivities: function () {
                return activities.getList();
            },

            getPlannedActivities: function () {
                return plannedActivities.getList();
            },
            isActivityPlanned: function (plannedActivities, activityId) {
                if (typeof (plannedActivities) !== 'undefined') {
                    for (var i = 0; i < plannedActivities.length; i++) {
                        if (plannedActivities[i].activity_id === activityId) {
                            return true;
                        }
                    }
                }
                return false;
            }

        };

        return actService;
    }])

    .filter('ActivityListFilter', [function () {
        return function (activities, query) {
            var out = [], allClusters = true;

            // if we do not get a query, we return the full set of answers
            if (!query) {
                return activities;
            }


            angular.forEach(query.cluster, function (value, key) {
                if (value) {
                    allClusters = false;
                }
            });

            var allTopics = true;
            angular.forEach(query.topic, function (value, key) {
                if (value) {
                    allTopics = false;
                }
            });


            var allRatings = true;
            angular.forEach(query.rating, function (value, key) {
                if (value) {
                    allRatings = false;
                }
            });

            var ratingsMapping = ['none', 'one', 'two', 'three', 'four', 'five'];
            var allTimes = true;
            angular.forEach(query.times, function (value, key) {
                if (value) {
                    allTimes = false;
                }
            });


            angular.forEach(activities, function (activity, key) {

                    if ((allClusters || _.any(activity.field, function (value) {
                        return query.cluster[value];
                    })) &&
                        (allTopics || _.any(activity.topic, function (value) {
                            return query.topic[value];
                        })) &&
                        (allRatings || query.rating[ratingsMapping[activity.rating]]
                            ) &&
                        (allTimes || query.time[activity.time]
                            ) &&
                        (!query.fulltext || activity.title.toUpperCase().indexOf(query.fulltext.toUpperCase()) !== -1)
                        ) {
                        out.push(activity);
                    }
                }
            );
            return out;

        };
    }]
    )

    .filter('startFrom', [function () {
        return function (input, start) {
            start = +start; //parse to int
            return input.slice(start);
        };
    }])

    .controller('ActivityCtrl', ['$scope', 'ActivityService', '$timeout', '$state', '$stateParams', 'allActivities', 'plannedActivities',
        function ($scope, ActivityService, $timeout, $state, $stateParams, allActivities, plannedActivities) {


            //////////////
            // private functions

            function setSelectedActivity(activityId) {
                $scope.currentActivity = getActivityFromId(activityId);


                var savedActivityPlan = _.find(plannedActivities, function (obj) {
                    return obj.activity_id === activityId;
                });

                if (!savedActivityPlan) {
                    savedActivityPlan = {
                        "activity_id": $scope.currentActivity.id,
                        "field": $scope.currentActivity.field,
                        "planType": $scope.currentActivity.defaultplantype,
                        "privacyType": $scope.currentActivity.defaultprivacy,
                        "executionType": $scope.currentActivity.defaultexecutiontype,
                        "visibility": $scope.currentActivity.defaultvisibility,
                        "duration": 15,
                        "repeatWeeks": 6
                    };
                }

                $scope.currentActivityPlan = savedActivityPlan;
            }

            function getActivityFromId(activityId) {
                var act = _.find(allActivities, function (obj) {
                    return obj.id === activityId;
                });
                if (!act) {
                    throw new Error('no activity found for id ') + activityId;
                }
                return   act;
            }

            // set the selected activity from the URL params
            setSelectedActivity($stateParams.activityId);

            // one time planning using daypicker
            $scope.showWeeks = false;
            $scope.minDate = new Date();

            $scope.open = function () {
                $timeout(function () {
                    $scope.opened = true;
                });
            };
            $scope.dateOptions = {
                'year-format': "'yy'",
                'starting-day': 1
            };

            // weeklyplanning using dayselector
            $scope.availableDays = [
                {label: 'MONDAY'},
                {label: 'TUESDAY'},
                {label: 'WEDNESDAY'},
                {label: 'THURSDAY'},
                {label: 'FRIDAY'},
                {label: 'SATURDAY'},
                {label: 'SUNDAY'}
            ];

            $scope.isActivityPlanned = function (activityId) {
                return ActivityService.isActivityPlanned(plannedActivities, activityId);
            };

            $scope.planActivityDone = function () {
                // save Activity Plan
                // transition to cockpit
                $state.go('cockpit');
            };


        }])

    .controller('ActivityListCtrl', ['$scope', '$filter', '$state', 'allActivities', 'plannedActivities',
        function ($scope,  $filter, $state, allActivities, plannedActivities) {

            // enrich plain activities with planning Data
            _.forEach(allActivities, function (act) {
                var matchingPlan = _.find(plannedActivities, function (plan) {
                    return (act.id === plan.activity.id);
                });
                act.plan = matchingPlan;
            });


            $scope.activities = allActivities;
            $scope.filteredActivities = allActivities;
            $scope.plannedActivities = plannedActivities;


            $scope.clusters = [
                {
                    "id": "AwarenessAbility",
                    "beschreibungdt": "Bewusstsein und Fähigkeit"
                },
                {
                    "id": "TimeManagement",
                    "beschreibungdt": "Zeitmanagement"
                },
                {
                    "id": "WorkStructuring",
                    "beschreibungdt": "Arbeitsgestaltung"
                },
                {
                    "id": "PhysicalActivity",
                    "beschreibungdt": "Körperliche Aktivität"
                },
                {
                    "id": "Nutrition",
                    "beschreibungdt": "Ernährung"
                },
                {
                    "id": "LeisureActivity",
                    "beschreibungdt": "Freizeitaktivität"
                },
                {
                    "id": "Breaks",
                    "beschreibungdt": "Pausen"
                },
                {
                    "id": "Relaxation",
                    "beschreibungdt": "Entspannung"
                },
                {
                    "id": "SocialInteraction",
                    "beschreibungdt": "Sozialer Austausch"
                }
            ];

            $scope.getClusterName = function (clusterId) {
                var cluster = _.find($scope.clusters, function (obj) {
                    return obj.id === clusterId;
                });
                if (cluster) {
                    return cluster.beschreibungdt;
                } else {
                    return undefined;
                }
            };

            $scope.gotoActivityDetail = function (activity) {
                $state.go('activityDetail.' + activity.defaultexecutiontype, {activityId: activity.id});
            };

            $scope.query = {
                cluster: {
                    general: false,
                    fitness: false,
                    nutrition: false,
                    wellness: false
                },
                rating: {
                    five: false,
                    four: false,
                    three: false,
                    two: false,
                    one: false
                },
                time: {
                    t15: false,
                    t30: false,
                    t60: false,
                    more: false
                },
                topic: {
                    workLifeBalance: true,
                    physicalFitness: false,
                    nutrition: false,
                    mentalFitness: false
                },
                fulltext: ""
            };


            $scope.pageSize = 20;
            $scope.maxSize = 10;
            $scope.currentPage = 1;

            // watch for changes on the query object and reapply filter, use deep watch=true
            $scope.$watch('query', function (newQuery) {
                $scope.currentPage = 1;
                $scope.filteredActivities = $filter('ActivityListFilter')($scope.activities, $scope.query);
            }, true);
        }])
;

