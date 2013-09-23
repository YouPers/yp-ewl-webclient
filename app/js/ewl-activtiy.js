'use strict';

angular.module('yp.ewl.activity', [])


    .factory('ActivityService', ['$http', function ($http) {

/**
        function Activity(id, title, text, af, plCat) {
            this.id = id;
            this.title = title;
            this.text = text;
            this.field = af;
            this.planningCat = plCat;
        }
*/
        var activityProposals = $http.get('js/mockdata/testactivities.json').then(function (result) {
            return result.data;
        });

        var plannedActivities = $http.get('js/mockdata/testplannedactivities.json').then(function (result) {
            return result.data;
        });

        var selectedActivity;

        var selectedActivityPlan;

        var actService = {
            allActivities: activityProposals,
            plannedActivities: plannedActivities,
            getSelectedActivity: function () {
                return selectedActivity;
            },
            getSelectedActivityPlan: function () {
                return selectedActivityPlan;
            },

            setSelectedActivity: function (activityId, allActivities, plannedActivities) {
                if (plannedActivities && allActivities) {
                    selectedActivity = _.find(allActivities, function (obj) {
                        return obj.id === activityId;
                    });

                    selectedActivityPlan = null;
                    selectedActivityPlan = _.find(plannedActivities, function (obj) {
                        return obj.activity_id ===activityId;
                    });

                    if (!selectedActivityPlan) {
                        selectedActivityPlan = {
                            "activity_id": selectedActivity.id,
                            "field": selectedActivity.field,
                            "planType": selectedActivity.defaultplantype,
                            "privacyType" : selectedActivity.defaultprivacy,
                            "executionType": selectedActivity.defaultexecutiontype,
                            "visibility": selectedActivity.defaultvisibility,
                            "duration": 15,
                            "repeatWeeks": 6
                        };
                    }
                } else {
                    selectedActivity = {};
                    selectedActivityPlan = {};
                }
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
                        (allRatings || query.rating[ratingsMapping[activity.rating]]) &&
                        (allTimes || query.time[activity.time])) {
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

    .controller('ActivityCtrl', ['$scope', 'ActivityService', '$timeout', '$state','$stateParams', 'allActivities', 'plannedActivities',
        function ($scope, ActivityService, $timeout, $state, $stateParams, allActivities, plannedActivities) {

            $scope.activities = allActivities;

            $scope.plannedActivities = plannedActivities;

            ActivityService.setSelectedActivity($stateParams.activityId, $scope.activities, $scope.plannedActivities);

            $scope.currentActivity = ActivityService.getSelectedActivity();
            $scope.currentActivityPlan = ActivityService.getSelectedActivityPlan();


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
                return ActivityService.isActivityPlanned($scope.plannedActivities, activityId);
            };

            $scope.planActivityDone = function() {
                // save Activity Plan
                // transition to cockpit
                $state.go('cockpit');
            };

        }])

    .controller('ActivityListCtrl', ['$scope', 'ActivityService', '$filter', '$state',
        function ($scope, ActivityService, $filter, $state) {
        ActivityService.allActivities.then(function (data) {
            $scope.activities = data;
            $scope.filteredActivities = data;

        });

        ActivityService.plannedActivities.then(function (data) {
            $scope.plannedActivities = data;
        });

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

        $scope.getClusterName = function(clusterId){
            var cluster = _.find($scope.clusters, function(obj) {
                return obj.id === clusterId;
            });
            if (cluster) {
                return cluster.beschreibungdt;
            } else {
                return undefined;
            }
        };



        $scope.isActivityPlanned = function (activityId) {
            return ActivityService.isActivityPlanned($scope.plannedActivities, activityId);
        };

        $scope.gotoActivityDetail = function (activityId) {
            $state.go('activityDetail', {activityId: activityId});
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
            }

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

