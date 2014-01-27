'use strict';

angular.module('yp.ewl.activity', ['restangular', 'ui.router', 'yp.auth'])

    .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
        function ($stateProvider, $urlRouterProvider, accessLevels) {
            $stateProvider
                .state('activitylist', {
                    url: "/activities?tab&page",
                    templateUrl: "yp.activity/activity.list.html",
                    controller: "ActivityListCtrl",
                    access: accessLevels.all,
                    resolve: {
                        allActivities: ['ActivityService', function (ActivityService) {
                            return ActivityService.getActivities();
                        }],
                        activityPlans: ['ActivityService', function (ActivityService) {
                            return ActivityService.getActivityPlans();
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
                .state('activityAdmin', {
                    url: "/activities/:activityId/admin?tab&page",
                    templateUrl: "yp.activity/activity.admin.html",
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
                .state('activityPlan', {
                    url: "/activities/:activityId?tab&page",
                    templateUrl: "yp.activity/activity.detail.html",
                    controller: "ActivityDetailCtrl",
                    access: accessLevels.individual,
                    resolve: {
                        activity: ['ActivityService', '$stateParams', function (ActivityService, $stateParams) {
                            return ActivityService.getActivity($stateParams.activityId);
                        }],
                        plan: ['ActivityService', '$stateParams', function (ActivityService, $stateParams) {
                            return ActivityService.getPlanForActivity($stateParams.activityId, {populate: ['activity', 'joiningUsers']});
                        }],
                        actPlansToJoin: ['ActivityService', '$stateParams', function (ActivityService, $stateParams) {
                            return ActivityService.getPlansToJoin($stateParams.activityId);
                        }]
                    }
                })
                .state('activityPlanInvite', {
                    url: "/activities/:activityId/invitation?invitingUserId",
                    templateUrl: "yp.activity/activity.activityplaninvite.html",
                    controller: "ActivityPlanInviteCtrl",
                    access: accessLevels.all,
                    resolve: {
                        activity: ['ActivityService', '$stateParams', function (ActivityService, $stateParams) {
                            return ActivityService.getActivity($stateParams.activityId);
                        }],
                        invitingUser: ['yp.user.UserService', '$stateParams', function (UserService, $stateParams) {
                            return UserService.getUser($stateParams.invitingUserId);
                        } ]
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
                        if (_.contains(starredActivities, act.id)) {
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

        Restangular.extendCollection('activityplans', function (actPlanList) {
                if (actPlanList) {  // Issue WL-136: Safari does not like assigning function to undefined when using 'use strict'; at top of file.
                    actPlanList.getEventsByTime = function () {
                        var actEventsByTime = [];
                        // concat array for every plan
                        for (var i = 0; i < actPlanList.length; i++) {
                            actEventsByTime = actEventsByTime.concat(actPlanList[i].getEventsByTime());
                        }

                        return actEventsByTime;
                    };
                }

                return actPlanList;
            }
        );

        Restangular.extendModel('activityplans', function (actPlan) {
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
                        "endby": {
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
                        "endby": {
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
                        "endby": {
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
        var activityPlans = Restangular.all('activityplans');

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
            getActivityPlans: function (options) {
                if (principal.isAuthenticated()) {
                    return activityPlans.getList(options);
                } else {
                    var deferred = $q.defer();
                    deferred.resolve([]);
                    return deferred.promise;
                }
            },
            getPlansToJoin: function (activityId) {
                var params = {
                    'populate': ['owner', 'joiningUsers'],
                    'activity': activityId,
                    'filter[status]': 'active',
                    sort: 'mainEvent.start:-1'
                };
                return Restangular.all('activityplans/joinOffers').getList(params);
            },
            getPlanForActivity: function (activityId, options) {
                if (!options) {
                    options = {};
                }
                _.merge(options, {'filter[activity]': activityId});
                return Restangular.all('activityplans').getList(options).then(function (result) {
                    if (result.length === 0) {
                        return null;
                    } else if (result.length > 1) {
                        throw new Error('only one plan expected per activity and user');
                    } else {
//                        result[0].deleteStatus = "ACTIVITYPLAN_DELETE_NO";
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
            invalidateRecommendations: function () {
                cachedRecommendationsPromises = {};
            },
            savePlan: function (plan) {
                if (plan.id) {
                    console.log("updating of existing plans not yet supported!");
                    return {then: function (suc, err) {
                        return err("updating of existing plans not yet supported!");
                    }};
                } else {
                    return activityPlans.post(plan).then(function success(result) {
                        console.log("plan saved" + result);
                        return result;
                    }, function error(err) {
                        console.log("error on plan post" + err);
                        return err;
                    });
                }
            },
            deletePlan: function (plan) {
                console.log("try to delete current plan");
                return activityPlans.one(plan.id).remove().then(function success(result) {
                    return result;
                }, function error(err) {
                    console.log("error on plan remove" + err);
                    return err;
                });
            },
            updateActivityEvent: function (planId, actEvent) {
                return Restangular.restangularizeElement(null, actEvent, 'activityplans/' + planId + '/events').put();
            },
            inviteEmailToJoinPlan: function (email, plan) {
                return activityPlans.one(plan.id).all('/inviteEmail').post({email: email});
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
        '$state', '$rootScope', '$sce', 'actPlansToJoin',
        function ($scope, ActivityService, $timeout, activity, plan, $state, $rootScope, $sce, actPlansToJoin) {

            $scope.currentActivity = activity;
            // using a model.xxxx to have writable access to this porperty in child scopes (e.g. in the two tabs)
            $scope.model = {
                currentExecutionType:  actPlansToJoin.length > 0 ? 'group' : 'self'
            };

            $scope.actPlansToJoin = actPlansToJoin;

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

            $scope.getRenderedText = function (activity) {
                if (activity.text) {
                    return $sce.trustAsHtml(markdown.toHTML(activity.text));
                } else {
                    return "";
                }
            };

            $scope.joinPlan = function (planToJoin) {
                var slavePlan = _.clone(planToJoin);
                delete slavePlan.id;
                slavePlan.joiningUsers = [];
                slavePlan.owner = $scope.principal.getUser().id;
                slavePlan.masterPlan = planToJoin.id;
                ActivityService.savePlan(slavePlan).then(function (slavePlanReloaded) {
                        $rootScope.$broadcast('globalUserMsg', 'Successfully joined the group activity', 'success', '5000');

                        // The post call returns the updated activityPlan, but does not populate the activity property,
                        // no problem, we already have the activity in the session
                        slavePlanReloaded.activity = $scope.currentActivity;
                        $scope.currentActivityPlan = slavePlanReloaded;
                    },
                    function (err) {
                        $rootScope.$broadcast('globalUserMsg', 'Unable to join group activity: ' + err, 'danger', '5000');

                    });
            };

            $scope.inviteEmailToJoinPlan = function (email, activityPlan) {
                $scope.model.inviteEmail = "";

                $scope.$broadcast('formPristine');
                ActivityService.inviteEmailToJoinPlan(email, activityPlan).then(
                    function success (result) {
                        $rootScope.$broadcast('globalUserMsg', email +' erfolgreich eingeladen!', 'success', 5000);
                    },
                    function error (err) {
                        $rootScope.$broadcast('globalUserMsg', 'Einladung konnte nicht versendet werden: '+ err.status, 'danger', 5000);
                    }
                );
            };

            $scope.isActivityPlanned = function () {
                return $scope.currentActivityPlan.id;
            };

            $scope.planActivityCancel = function () {
                if ($scope.$modalInstance) {
                    $scope.$modalInstance.dismiss();
                } else {
                    $scope.$state.go('activitylist', $rootScope.$stateParams);
                }
            };

            $scope.planActivityDone = function () {
                ActivityService.savePlan($scope.currentActivityPlan).then(function (result) {
                    $rootScope.$broadcast('globalUserMsg', 'Aktivität erfolgreich eingeplant', 'success', '5000');
                    if ($scope.$modalInstance) {
                        $scope.$modalInstance.dismiss();
                    } else {
                        $scope.$state.go('activitylist', $rootScope.$stateParams);
                    }
                }, function (err) {
                    console.log(JSON.stringify(err));
                    $rootScope.$broadcast('globalUserMsg', 'Aktivität nicht gespeichert, Code: ' + err, 'danger', '5000');
                });
            };

            $scope.planActivityDelete = function () {
                ActivityService.deletePlan($scope.currentActivityPlan).then(function (result) {
                    $rootScope.$broadcast('globalUserMsg', 'Aktivität erfolgreich gelöscht', 'success', '5000');
                    if ($scope.$modalInstance) {
                        $scope.$modalInstance.dismiss();
                    } else {
                        $state.go('activitylist', $rootScope.$stateParams);
                    }
                }, function (err) {
                    console.log(JSON.stringify(err));
                    $rootScope.$broadcast('globalUserMsg', 'Aktivität nicht gelöscht, Code: ' + err, 'danger', '5000');
                });
            };
        }])

    .controller('ActivityListCtrl', ['$scope', '$filter', 'allActivities', 'activityPlans', 'activityFields',
        'recommendations', 'yp.user.UserService', 'topStressors', 'assessment', 'ActivityService',
        function ($scope, $filter, allActivities, activityPlans, activityFields, recommendations, UserService, topStressors, assessment, ActivityService) {

            // mock campaigns, that this user has an active goal for, should be loaded from server later...
            var campaigns = ['Campaign-1'];

            $scope.hasRecommendations = (recommendations.length > 0);

            var starredActs = $scope.principal &&
                $scope.principal.getUser() &&
                $scope.principal.getUser().preferences &&
                $scope.principal.getUser().preferences.starredActivities || {};

            allActivities.enrichWithUserData(activityPlans, recommendations, campaigns, starredActs);

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
                    allActivities.enrichWithUserData(activityPlans, newRecs, campaigns, starredActs);
                    $scope.filteredActivities = $filter('ActivityListFilter')($scope.activities, $scope.query);
                });

            };

            $scope.gotoActivityDetail = function (activity) {
                // goto detail state, keep active tab around as stateparameter
                $scope.$state.go('activityPlan', {activityId: activity.id, tab: $scope.$stateParams.tab, page: $scope.currentPage});
            };


            $scope.toggleStar = function (activity, event) {
                event.stopPropagation();
                activity.starred = !activity.starred;
                var user = $scope.principal.getUser();
                if (!user.preferences) {
                    user.preferences = {};
                }
                if (!user.preferences.starredActivities) {
                    user.preferences.starredActivities = [];
                }

                if (_.contains(user.preferences.starredActivities, activity.id)) {
                    _.remove(user.preferences.starredActivities, function (id) {
                        return id === activity.id;
                    });
                } else {
                    user.preferences.starredActivities.push(activity.id);
                }
                UserService.putUser(user);

            };
            $scope.countStarredActivities = function () {
                //TODO: consider initialization at an earlier point to prevent checks like this
                if (_.isUndefined($scope.principal.getUser().preferences)) {
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

    .controller('ActivityAdminCtrl', ['$scope', '$rootScope',  'activity', 'assessment', 'ActivityService', 'activityFields', 'Restangular',
        function ($scope, $rootScope, activity, assessment, ActivityService, activityFields, Restangular) {

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
                            $scope.$state.go('activitylist', $rootScope.$stateParams);
                        });
                    }, function (err) {
                        $rootScope.$broadcast('globalUserMsg', 'Error while saving Activity, Code: ' + err.status, 'danger', 5000);
                    });
                } else {
                    activity.post().then(function (result) {
                        ActivityService.reloadActivities().then(function () {
                            $rootScope.$broadcast('globalUserMsg', 'activity saved successfully', 'success', 5000);
                            $scope.$state.go('activitylist', $rootScope.$stateParams);
                        });
                    }, function (err) {
                        $rootScope.$broadcast('globalUserMsg', 'Error while saving Activity, Code: ' + err.status, 'danger', 5000);
                    });
                }
            };

            $scope.cancel = function () {
                $scope.$state.go('activitylist');
            };
        }])

    .controller('ActivityPlanInviteCtrl', ['$scope', 'ActivityService', 'activity', 'invitingUser', '$rootScope',
        function ($scope, ActivityService, activity, invitingUser, $rootScope) {


            // if the user is authenticated we immediatly go to the corresponding activity so he can join
            if ($scope.principal.isAuthenticated()) {
                $scope.$state.go('activityPlan' , {activityId: activity.id});
            }

            $scope.activity = activity;
            $scope.invitingUser = invitingUser;

            $scope.showRegistrationDialog = function() {
                $rootScope.$broadcast('loginMessageShow', {toState: 'activityPlan', toParams: {activityId: activity.id}, registration: true});
            };
        }
    ]);
