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
                        }],
                        recommendations: ['ActivityService', function (ActivityService) {
                            return ActivityService.getRecommendations();
                        }]
                    }
                })
                .state('activityAdmin', {
                    url: "/activities/:activityId/admin",
                    templateUrl: "partials/activity.admin.html",
                    controller: "ActivityAdminCtrl",
                    access: accessLevels.individual,
                    resolve: {
                        activity: ['ActivityService', '$stateParams', function (ActivityService, $stateParams) {
                            return ActivityService.getActivity($stateParams.activityId);
                        }],
                        assessment: ['AssessmentService', function (AssessmentService) {
                            return AssessmentService.getAssessment('525faf0ac558d40000000005');
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

    .constant('activityFields', {
        AwarenessAbility: "Bewusstsein und Fähigkeit",
        TimeManagement: "Zeitmanagement",
        WorkStructuring: "Arbeitsgestaltung",
        PhysicalActivity: "Körperliche Aktivität",
        Nutrition: "Ernährung",
        LeisureActivity: "Freizeitaktivität",
        Breaks: "Pausen",
        Relaxation: "Entspannung",
        SocialInteraction: "Sozialer Austausch"
    })

    // Object methods for all Assessment related objects
    .run(['Restangular', function (Restangular) {
        Restangular.extendCollection('activities', function (activities) {
                activities.enrichWithUserData = function (plans, recommendations, campaigns) {
                    _.forEach(activities, function (act) {

                        var matchingPlan = _.find(plans, function (plan) {
                            return (act.id === plan.activity);
                        });

                        act.plan = matchingPlan;
                        act.isCampaign = (campaigns.indexOf(act.campaign) !== -1);
                        var rec = _.find(recommendations, {'activity': act.id});
                        if (rec) {
                            act.isRecommended = true;
                            act.recWeight = rec.weight;
                        }
                    });
                };
                return activities;
            }
        );

        Restangular.extendCollection('activitiesPlanned', function (actPlanList) {
            actPlanList.getEventsByTime = function () {
                var actEventsByTime = [];
                // create array structured by time
                for (var i = 0; i < actPlanList.length; i++) {
                    for (var i2 = 0; i2 < actPlanList[i].events.length; i2++) {
                        actEventsByTime.push({
                            event: actPlanList[i].events[i2],
                            plan: actPlanList[i],
                            activity: actPlanList[i].activity
                        });
                    }
                }

                return actEventsByTime;
            };
            return actPlanList;
        });

        Restangular.extendModel('activities', function (activity) {

            activity.getDefaultPlan = function () {
                var now = moment();
                var newMainEvent = {
                    "allDay": false
                };
                if (activity.defaultfrequency === 'week') {
                    newMainEvent.start = moment(now).startOf('hour');
                    newMainEvent.end = moment(newMainEvent.start).add('h', 1);
                    newMainEvent.frequency = 'week';
                    newMainEvent.recurrence = {
                        "end-by": {
                            "type": "after",
                            "after": 6
                        },
                        every: 1
                    };
                } else if (activity.defaultfrequency === 'day') {
                    newMainEvent.start = moment(now).add('d', 1).startOf('hour');
                    newMainEvent.end = moment(newMainEvent.start).add('h', 1);
                    newMainEvent.frequency = 'day';
                    newMainEvent.recurrence = {
                        "end-by": {
                            "type": "after",
                            "after": 6
                        },
                        every: 1
                    };
                } else { // default is "once"
                    newMainEvent.start = moment(now).add('d', 7).startOf('hour');
                    newMainEvent.end = moment(newMainEvent.start).add('h', 1);
                    newMainEvent.frequency = 'once';
                    newMainEvent.recurrence = {
                        "end-by": {
                            "type": "after",
                            "after": 6
                        },
                        every: 1
                    };
                }


                return {
                    activity: activity,
                    status: 'active',
                    mainEvent: newMainEvent,
                    executionType: activity.defaultexecutiontype,
                    visibility: activity.defaultvisibility
                };
            };

            activity.getRecWeightsByQuestionId = function () {
                var byId = {};
                _.forEach(activity.recWeights, function (obj) {
                    byId[obj.question] = obj;
                });
                return byId;
            };

            return activity;
        });

    }])

    .
    factory('ActivityService', ['$http', 'Restangular', '$q', 'principal', function ($http, Restangular, $q, principal) {
        var activities = Restangular.all('activities');
        var plannedActivities = Restangular.all('activitiesPlanned');

        var actService = {
            getActivities: function () {
                return activities.getList({limit: 1000});
            },

            getActivity: function (activityId) {
                return Restangular.one('activities', activityId).get();
            },
            getPlannedActivities: function (options) {
                if (principal.isAuthenticated()) {
                    return plannedActivities.getList(options);
                } else {
                    return [];
                }
            },
            getRecommendations: function () {
                if (principal.isAuthenticated()) {
                    return Restangular.all('activities/recommendations').getList();
                } else {
                    return [];
                }

            },
            savePlan: function (plan) {
                if (plan.id) {
                    console.log("updating of existing plans not yet supported!");
                    return {then: function (suc, err) {
                        return err("updating of existing plans not yet supported!");
                    }};
                } else {
                    return plannedActivities.post(plan).then(function success(result) {
                        console.log("plan saved" + result);
                        return result;
                    }, function error(err) {
                        console.log("error on plan post" + err);
                        return err;
                    });
                }
            },
            updateActivityEvent: function (planId, actEvent) {
                return Restangular.restangularizeElement(null, actEvent, 'activitiesPlanned/' + planId + '/events').put();
            }
        };

        return actService;
    }])

/**
 * filters an array of activities by a given query, returns an array with all activities that match the query
 */
    .filter('ActivityListFilter', [function () {
        return function (activities, query) {
            var out = [],
                allClusters = true,
                allTopics = true,
                allTimes = true,
                allRatings = true,
                allExecutiontypes = true,
                subSetAll = true,
                ratingsMapping = ['none', 'one', 'two', 'three', 'four', 'five'];

            // if we do not get a query, we return the full set of answers
            if (!query) {
                return activities;
            }

            angular.forEach(query.cluster, function (value, key) {
                if (value) {
                    allClusters = false;
                }
            });

            angular.forEach(query.topic, function (value, key) {
                if (value) {
                    allTopics = false;
                }
            });

            angular.forEach(query.rating, function (value, key) {
                if (value) {
                    allRatings = false;
                }
            });

            angular.forEach(query.times, function (value, key) {
                if (value) {
                    allTimes = false;
                }
            });

            angular.forEach(query.executiontype, function (value, key) {
                if (value) {
                    allExecutiontypes = false;
                }
            });

            if (query.subset !== 'all') {
                subSetAll = false;
            }

            angular.forEach(activities, function (activity, key) {

                    if ((allClusters || _.any(activity.fields, function (value) {
                        return query.cluster[value];
                    })) &&
                        (allTopics || _.any(activity.topics, function (value) {
                            return query.topic[value];
                        })) &&
                        (allRatings || query.rating[ratingsMapping[activity.rating]]
                            ) &&
                        (allExecutiontypes || query.executiontype[activity.defaultexecutiontype]) &&
                        (allTimes || query.time[activity.time]
                            ) &&
                        (subSetAll || (query.subset === 'campaign' && activity.isCampaign) ||
                            (query.subset === 'recommendations' && activity.isRecommended)) &&
                        (!query.fulltext || (activity.title.toUpperCase() + activity.number.toUpperCase()).indexOf(query.fulltext.toUpperCase()) !== -1)
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


                var currentPlan = _.find(plannedActivities, function (obj) {
                    return obj.activity === activityId;
                });

                if (!currentPlan) {
                    currentPlan = $scope.currentActivity.getDefaultPlan();
                }

                $scope.currentActivityPlan = currentPlan;
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

            // weekplanning using dayselector
            $scope.availableDays = [
                {label: 'MONDAY'},
                {label: 'TUESDAY'},
                {label: 'WEDNESDAY'},
                {label: 'THURSDAY'},
                {label: 'FRIDAY'},
                {label: 'SATURDAY'},
                {label: 'SUNDAY'}
            ];

            $scope.isActivityPlanned = function () {
                return $scope.currentActivityPlan.id;
            };

            $scope.planActivityDone = function () {
                ActivityService.savePlan($scope.currentActivityPlan).then(function (result) {
                    $scope.$emit('globalUserMsg', 'Aktivität erfolgreich eingeplant', 'success', '5000');
                    $state.go('cockpit');
                }, function (err) {
                    console.log(JSON.stringify(err));
                    $scope.$emit('globalUserMsg', 'Aktivität nicht gespeichert, Code: ' + err, 'danger', '5000');

                });
            };
        }])

    .controller('ActivityListCtrl', ['$scope', '$filter', '$state', 'allActivities', 'plannedActivities', 'activityFields', 'recommendations',
        function ($scope, $filter, $state, allActivities, plannedActivities, activityFields, recommendations) {

            // mock campaigns, that this user has an active goal for, should be loaded from server later...
            var campaigns = ['Campaign-1'];

            $scope.hasRecommendations = (recommendations.length > 0);

            allActivities.enrichWithUserData(plannedActivities, recommendations, campaigns);

            $scope.activities = allActivities;
            $scope.filteredActivities = allActivities;

            $scope.activityFields = activityFields;

            $scope.gotoActivityDetail = function (activity) {
                $state.go('activityDetail.' + activity.defaultexecutiontype, {activityId: activity.id});
            };

            $scope.setListTab = function (tabId) {
                $scope.query.subset = tabId;
            };

            $scope.query = {
                subset: 'recommendations',
                cluster: {
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
                fulltext: "",
                executiontype: {
                    self: false,
                    group: false
                }
            };


            $scope.pageSize = 20;
            $scope.maxSize = 10;
            $scope.currentPage = 1;

            // watch for changes on the query object and reapply filter, use deep watch=true
            // whenever the query changes, update the filtered List of activities to the new query and
            // jump back to page on of pagination
            $scope.$watch('query', function (newQuery) {
                $scope.currentPage = 1;
                $scope.filteredActivities = $filter('ActivityListFilter')($scope.activities, $scope.query);
            }, true);
        }])

    .controller('ActivityAdminCtrl', ['$scope', 'activity', 'assessment', 'ActivityService', 'activityFields', 'Restangular', '$state',
        function ($scope, activity, assessment, ActivityService, activityFields, Restangular, $state) {

            $scope.activity = activity;
            $scope.assessment = assessment;
            $scope.activityFields = activityFields;

            $scope.actFieldsModel = {};

            _.forEach(activityFields, function (fieldDesc, fieldId) {
                $scope.actFieldsModel[fieldId] = (activity.fields.indexOf(fieldId) !== -1);
            });

            $scope.$watch('actFieldsModel', function (newValue, oldValue, scope) {
                var newFields = [];
                _.forEach(newValue, function (value, key) {
                    if (value) {
                        newFields.push(key);
                    }
                });
                activity.fields = newFields;
            }, true);

            if (!activity.qualityFactor) {
                activity.qualityFactor = 1;
            }
            // Weihting to generate recommendation of activity based on answers of this assessment
            // initialize weights if they do not yet exist
            if (!activity.recWeights || activity.recWeights.length === 0) {
                activity.recWeights = [];
                _.forEach(assessment.questionCats, function (cat) {
                    _.forEach(cat.questions, function (question) {
                        activity.recWeights.push({question: question.id, negativeAnswerWeight: 0, positiveAnswerWeight: 0});
                    });
                });
            }

            $scope.recWeights = activity.getRecWeightsByQuestionId();

            $scope.save = function () {

                activity.put().then(function (result) {
                    $scope.$emit('globalUserMsg', 'activity saved successfully', 'success', 5000);
                    $state.go('activitylist');
                }, function (err) {
                    $scope.$emit('globalUserMsg', 'Error while saving Activity, Code: ' + err.status, 'danger', 5000);
                });
            };

            $scope.cancel = function () {
                $state.go('activitylist');
            };
        }]);