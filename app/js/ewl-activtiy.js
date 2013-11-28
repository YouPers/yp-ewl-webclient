'use strict';

angular.module('yp.ewl.activity', ['restangular', 'ui.router', 'yp.auth'])

    .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
        function ($stateProvider, $urlRouterProvider, accessLevels) {
            $stateProvider
                .state('activitylist', {
                    url: "/activities?tab&page",
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
                        }],
                        topStressors: ['AssessmentService', function (AssessmentService) {
                            return AssessmentService.topStressors();
                        }],
                        assessment: ['AssessmentService', function (AssessmentService) {
                            return AssessmentService.getAssessment('525faf0ac558d40000000005');
                        }]

                    }
                })
                .state('modal_activityAdmin', {
                    url: "/activities/:activityId/admin?tab&page",
                    views: {
                        '': {
                            template: "="
                        },
                        modal: {
                            templateUrl: "partials/activity.admin.html",
                            controller: "ActivityAdminCtrl"
                        }
                    },
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
                .state('modal_activityPlan', {
                    url: "/activities/:activityId?tab&page",
                    views: {
                        '': {
                            template: "="
                        },
                        modal: {
                            templateUrl: "partials/activity.detail.html",
                            controller: "ActivityDetailCtrl"
                        }
                    },
                    access: accessLevels.individual,
                    resolve: {
                        activity: ['ActivityService', '$stateParams', function (ActivityService, $stateParams) {
                            return ActivityService.getActivity($stateParams.activityId);
                        }],
                        plan: ['ActivityService', '$stateParams', function (ActivityService, $stateParams) {
                            return ActivityService.getPlanForActivity($stateParams.activityId, {populate: 'activity'});
                        }]
                    }
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
                activities.enrichWithUserData = function (plans, recommendations, campaigns, starredActivities) {
                    _.forEach(activities, function (act) {

                        var matchingPlan = _.find(plans, function (plan) {
                            return (act.id === plan.activity);
                        });

                        act.plan = matchingPlan;
                        act.isCampaign = (campaigns.indexOf(act.campaign) !== -1);
                        if (starredActivities[act.id]) {
                            act.starred = true;
                        }
                        var rec = _.find(recommendations, {'activity': act.id});
                        if (rec) {
                            act.isRecommended = true;
                            act.recWeight = rec.weight;
                        } else {
                            delete act.isRecommended;
                            delete act.recWeight;
                        }
                    });
                };
                return activities;
            }
        );

        Restangular.extendCollection('activitiesPlanned', function (actPlanList) {
                actPlanList.getEventsByTime = function () {
                    var actEventsByTime = [];
                    // concat array for every plan
                    for (var i = 0; i < actPlanList.length; i++) {
                        actEventsByTime = actEventsByTime.concat(actPlanList[i].getEventsByTime());
                    }

                    return actEventsByTime;
                };

                return actPlanList;
            }
        );

        Restangular.extendModel('activitiesPlanned', function (actPlan) {
            actPlan.getEventsByTime = function () {
                var actEventsByTime = [];
                for (var i = 0; i < actPlan.events.length; i++) {
                    actEventsByTime.push({
                        event: actPlan.events[i],
                        plan: actPlan,
                        activity: actPlan.activity
                    });
                }

                return actEventsByTime;
            };

            return actPlan;
        });

        Restangular.extendModel('activities', function (activity) {

            activity.getDefaultPlan = function () {
                var now = moment();
                var newMainEvent = {
                    "allDay": false
                };
                var duration = activity.defaultduration ? activity.defaultduration : 60;
                if (activity.defaultfrequency === 'week') {
                    newMainEvent.start = moment(now).startOf('hour').toDate();
                    newMainEvent.end = moment(newMainEvent.start).add('m', duration).toDate();
                    newMainEvent.frequency = 'week';
                    newMainEvent.recurrence = {
                        "end-by": {
                            "type": "after",
                            "after": 6
                        },
                        every: 1
                    };
                } else if (activity.defaultfrequency === 'day') {
                    newMainEvent.start = moment(now).add('d', 1).startOf('hour').toDate();
                    newMainEvent.end = moment(newMainEvent.start).add('m', duration).toDate();
                    newMainEvent.frequency = 'day';
                    newMainEvent.recurrence = {
                        "end-by": {
                            "type": "after",
                            "after": 6
                        },
                        every: 1
                    };
                } else { // default is "once"
                    newMainEvent.start = moment(now).add('d', 7).startOf('hour').toDate();
                    newMainEvent.end = moment(newMainEvent.start).add('m', duration).toDate();
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
                    visibility: activity.defaultvisibility,
                    fields: activity.fields,
                    topics: activity.topics
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

        var cachedActivitiesPromise;
        var cachedRecommendationsPromises = {};

        var actService = {
            getActivities: function () {
                // we assume, that activities are static / will not be changed on the server within a
                // reasonable timeframe, therefore we cache it on the client as long as the page is not refreshed
                if (!cachedActivitiesPromise) {
                    cachedActivitiesPromise = activities.getList({limit: 1000});
                }
                return cachedActivitiesPromise;
            },
            reloadActivities: function () {
                cachedActivitiesPromise = activities.getList({limit: 1000});
                cachedRecommendationsPromises = {};
                return cachedActivitiesPromise;
            },
            getActivity: function (activityId) {
                if (activityId) {
                    return Restangular.one('activities', activityId).get();
                } else {
                    var deferred = $q.defer();
                    deferred.resolve(null);
                    return deferred.promise;
                }
            },
            getPlannedActivities: function (options) {
                if (principal.isAuthenticated()) {
                    return plannedActivities.getList(options);
                } else {
                    var deferred = $q.defer();
                    deferred.resolve([]);
                    return deferred.promise;
                }
            },
            getPlanForActivity: function (activityId, options) {
                if (!options) {
                    options = {};
                }
                _.merge(options, {'filter[activity]': activityId});
                return Restangular.all('activitiesPlanned').getList(options).then(function (result) {
                    if (result.length === 0) {
                        return null;
                    } else if (result.length > 1) {
                        throw new Error('only one plan expected per activity and user');
                    } else {
                        return result[0];
                    }
                });
            },
            getRecommendations: function (focusQuestionId) {
                var params = {
                    limit: 1000
                };
                if (focusQuestionId) {
                    params.fokus = focusQuestionId;
                }
                if (principal.isAuthenticated()) {
                    if (!cachedRecommendationsPromises[focusQuestionId || 'default']) {
                        cachedRecommendationsPromises[focusQuestionId || 'default'] = Restangular.all('activities/recommendations').getList(params);
                    }
                    return cachedRecommendationsPromises[focusQuestionId || 'default'];
                } else {
                    return [];
                }

            },
            invalidateRecommendations: function() {
                cachedRecommendationsPromises = {};
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
            },
            getiCalUrl: function (planId) {
                return Restangular.one('activitiesPlanned', planId).getRestangularUrl() + '/ical.ics';
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
                ratingsMapping = ['none', 'one', 'two', 'three', 'four', 'five'],
                durationMapping = function (duration) {
                    if (duration < 15) {
                        return 't15';
                    } else if (duration <= 30) {
                        return 't30';
                    } else if (duration <= 60) {
                        return 't60';
                    } else {
                        return 'more';
                    }
                };

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

            angular.forEach(query.time, function (value, key) {
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
                        (allTimes || !activity.defaultduration || query.time[durationMapping(activity.defaultduration)]
                            ) &&
                        (subSetAll || (query.subset === 'campaign' && activity.isCampaign) ||
                            (query.subset === 'recommendations' && activity.isRecommended) ||
                            (query.subset === 'starred' && activity.starred)) &&
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

    .controller('ActivityDetailCtrl', ['$scope', 'ActivityService', '$timeout', 'activity', 'plan',
        '$state', '$rootScope', '$sce',
        function ($scope, ActivityService, $timeout, activity, plan, $state, $rootScope, $sce) {

            $scope.currentActivity = activity;
            $scope.currentExecutionType = activity.defaultexecutiontype;

            if (plan) {
                $scope.currentActivityPlan = plan;
            } else {
                $scope.currentActivityPlan = $scope.currentActivity.getDefaultPlan();
            }


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
                {label: 'MONDAY', value: "1"},
                {label: 'TUESDAY', value: "2"},
                {label: 'WEDNESDAY', value: "3"},
                {label: 'THURSDAY', value: "4"},
                {label: 'FRIDAY', value: "5"},
                {label: 'SATURDAY', value: "6"},
                {label: 'SUNDAY', value: "0"}
            ];

            function nextWeekday(date, weekday) {
                if (!weekday) {
                    return date;
                }
                var input = moment(date);
                var output = input.day(weekday);
                return output > moment(date) ? output.toDate() : output.add('week', 1).toDate();
            }


            $scope.$watch('currentActivityPlan.weeklyDay', function (newValue, oldValue) {
                if (newValue && $scope.currentActivityPlan.mainEvent.frequency === 'week') {
                    var duration = $scope.currentActivityPlan.mainEvent.end - $scope.currentActivityPlan.mainEvent.start;
                    $scope.currentActivityPlan.mainEvent.start = nextWeekday(new Date(), newValue);
                    $scope.currentActivityPlan.mainEvent.end = moment($scope.currentActivityPlan.mainEvent.start).add(duration);
                }
            });

            $scope.getiCalUrl = function () {
                return ActivityService.getiCalUrl($scope.currentActivityPlan.id);

            };

            $scope.getRenderedText = function (activity) {
                return $sce.trustAsHtml(markdown.toHTML(activity.text));
            };

            $scope.isActivityPlanned = function () {
                return $scope.currentActivityPlan.id;
            };

            $scope.planActivityCancel = function () {
                if ($scope.$modalInstance) {
                    $scope.$modalInstance.dismiss();
                } else {
                    $state.go('activitylist',$rootScope.$stateParams);
                }
            };

            $scope.planActivityDone = function () {
                ActivityService.savePlan($scope.currentActivityPlan).then(function (result) {
                    $rootScope.$broadcast('globalUserMsg', 'Aktivität erfolgreich eingeplant', 'success', '5000');
                    if ($scope.$modalInstance) {
                        $scope.$modalInstance.dismiss();
                    } else {
                        $state.go('activitylist',$rootScope.$stateParams);
                    }
                }, function (err) {
                    console.log(JSON.stringify(err));
                    $rootScope.$broadcast('globalUserMsg', 'Aktivität nicht gespeichert, Code: ' + err, 'danger', '5000');
                });
            };
        }])

    .controller('ActivityListCtrl', ['$scope', '$filter', 'allActivities', 'plannedActivities', 'activityFields',
        'recommendations', 'yp.user.UserService', 'topStressors', 'assessment', 'ActivityService',
        function ($scope, $filter, allActivities, plannedActivities, activityFields,
                  recommendations, UserService, topStressors, assessment, ActivityService) {

            // mock campaigns, that this user has an active goal for, should be loaded from server later...
            var campaigns = ['Campaign-1'];

            $scope.hasRecommendations = (recommendations.length > 0);

            var starredActs = $scope.principal &&
                $scope.principal.getUser() &&
                $scope.principal.getUser().preferences &&
                $scope.principal.getUser().preferences.starredActivities || {};

            allActivities.enrichWithUserData(plannedActivities, recommendations, campaigns, starredActs);

            $scope.activities = allActivities;
            $scope.filteredActivities = allActivities;
            $scope.activityFields = activityFields;


            _.forEach(topStressors, function (stressor) {
                stressor.title = assessment.questionLookup[stressor.question].title;
            });
            $scope.topStressors = topStressors;

            $scope.focusOnStressor = function (stressor) {
                var focusQuestion = null;
                if (stressor.focussed) {
                    focusQuestion = stressor.question;
                    _.forEach($scope.topStressors, function (myStressor) {
                        if (myStressor !== stressor) {
                            myStressor.focussed = false;
                        }
                    });
                }
                ActivityService.getRecommendations(focusQuestion).then(function (newRecs) {
                    allActivities.enrichWithUserData(plannedActivities, newRecs, campaigns, starredActs);
                    $scope.filteredActivities = $filter('ActivityListFilter')($scope.activities, $scope.query);
                });

            };

            $scope.gotoActivityDetail = function (activity) {
                // goto detail state, keep active tab around as stateparameter
                $scope.$state.go('modal_activityPlan', {activityId: activity.id, tab: $scope.$stateParams.tab, page: $scope.currentPage});
            };


            $scope.toggleStar = function (activity, event) {
                event.stopPropagation();
                activity.starred = !activity.starred;
                var user = $scope.principal.getUser();
                if (!user.preferences) {
                    user.preferences = {};
                }
                if (!user.preferences.starredActivities) {
                    user.preferences.starredActivities = {};
                }

                if (activity.id in user.preferences.starredActivities) {
                    delete user.preferences.starredActivities[activity.id];
                } else {
                    user.preferences.starredActivities[activity.id] = true;
                }
                UserService.putUser(user);

            };
            $scope.countStarredActivities = function() {
                //TODO: consider initialization at an earlier point to prevent checks like this
                if(_.isUndefined($scope.principal.getUser().preferences)) {
                    return '';
                }
                return _.size($scope.principal.getUser().preferences.starredActivities);
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

            function setListTab(tabId) {
                $scope.$state.go('activitylist', {tab: tabId});
            }

            // initialize correct Tab from state Params
            if ($scope.$stateParams.tab) {
               $scope.query.subset = $scope.$stateParams.tab;
            }

            $scope.setListTab = setListTab;


            $scope.pageSize = 20;
            $scope.maxSize = 8;

            $scope.currentPage = $scope.$stateParams.page || 1;

            // watch for changes on the query object and reapply filter, use deep watch=true
            // whenever the query changes, update the filtered List of activities to the new query and
            // jump back to first page of pagination
            $scope.$watch('query', function (newQuery) {
                // $scope.currentPage = 1;
                $scope.filteredActivities = $filter('ActivityListFilter')($scope.activities, $scope.query);
            }, true);
        }])

    .controller('ActivityAdminCtrl', ['$scope', '$rootScope', '$state', 'activity', 'assessment', 'ActivityService', 'activityFields', 'Restangular',
        function ($scope, $rootScope, $state, activity, assessment, ActivityService, activityFields, Restangular) {

            if (!activity) {
                activity = Restangular.restangularizeElement(null, {
                    number: 'NEW',
                    fields: [],
                    recWeights: [],
                    topics: ['workLifeBalance']
                }, 'activities');
            }
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
                if (activity.id) {
                    activity.put().then(function (result) {
                        ActivityService.reloadActivities().then(function () {
                            $rootScope.$broadcast('globalUserMsg', 'activity saved successfully', 'success', 5000);
                            $state.go('activitylist', $rootScope.$stateParams);
                        });
                    }, function (err) {
                        $rootScope.$broadcast('globalUserMsg', 'Error while saving Activity, Code: ' + err.status, 'danger', 5000);
                    });
                } else {
                    activity.post().then(function (result) {
                        ActivityService.reloadActivities().then(function () {
                            $rootScope.$broadcast('globalUserMsg', 'activity saved successfully', 'success', 5000);
                            $state.go('activitylist', $rootScope.$stateParams);
                        });
                    }, function (err) {
                        $rootScope.$broadcast('globalUserMsg', 'Error while saving Activity, Code: ' + err.status, 'danger', 5000);
                    });
                }
            };

            $scope.cancel = function () {
                $state.go('activitylist');
            };
        }]);
