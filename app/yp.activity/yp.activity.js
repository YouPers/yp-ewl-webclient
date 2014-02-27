(function () {
    'use strict';

    angular.module('yp.activity', ['restangular', 'ui.router', 'yp.user'])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('activitylist', {
                        url: "/activities?tab&page",
                        templateUrl: "yp.activity/yp.activity.list.html",
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
                        templateUrl: "yp.activity/yp.activity.admin.html",
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
                        templateUrl: "yp.activity/yp.activity.detail.html",
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
                        templateUrl: "yp.activity/yp.activity.activityplaninvite.html",
                        controller: "ActivityPlanInviteCtrl",
                        access: accessLevels.all,
                        resolve: {
                            activity: ['ActivityService', '$stateParams', function (ActivityService, $stateParams) {
                                return ActivityService.getActivity($stateParams.activityId);
                            }],
                            invitingUser: ['UserService', '$stateParams', function (UserService, $stateParams) {
                                return UserService.getUser($stateParams.invitingUserId);
                            } ]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('yp.activity');


            }])


        .run(['enums', function (enums) {
            _.merge(enums, {
                executiontype: [
                    'self',
                    'group'
                ],
                activityPlanFrequency: [
                    'once',
                    'day',
                    'week',
                    'month',
                    'year'
                ],
                visibility: [
                    'public',
                    'campaign',
                    'private'
                ],
                source: [
                    'youpers',
                    'community',
                    'campaign'
                ],
                calendarNotifications: [
                    'none',
                    '0',
                    '300',
                    '600',
                    '900',
                    '1800',
                    '3600',
                    '7200',
                    '86400',
                    '172800'
                ]
            });
        }])
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
                        source: 'community',
                        executionType: activity.defaultexecutiontype,
                        visibility: activity.defaultvisibility,
                        fields: activity.fields,
                        topics: activity.topics,
                        title: activity.title,
                        number: activity.number
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


        .factory('ActivityService', ['$http', 'Restangular', '$q', 'UserService', '$rootScope',
            function ($http, Restangular, $q, UserService, $rootScope) {
            var activities = Restangular.all('activities');
            var activityPlans = Restangular.all('activityplans');

            var cachedActivitiesPromise;
            var cachedRecommendationsPromises = {};

            $rootScope.$on('$translateChangeStart', function() {
                actService.reloadActivities();
            });

            $rootScope.$on('newAssessmentResultsPosted', function(assResult) {
                actService.invalidateRecommendations();
            });

            var actService = {
                getActivities: function (params) {
                    // we assume, that activities are static / will not be changed on the server within a
                    // reasonable timeframe, therefore we cache it on the client as long as the page is not refreshed
                    params = params || {};
                    params.limit = 1000;
                    if (!cachedActivitiesPromise) {
                        cachedActivitiesPromise = activities.getList(params);
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
                saveActivity: function(activity, success, error) {
                    if (activity.id) {
                        activity.put().then(function (result) {
                            actService.reloadActivities().then(function () {
                                if(success) { success(result); }
                            });
                        }, function (err) {
                            if(error) { error(err); }
                        });
                    } else {
                        activity.post().then(function (result) {
                            actService.reloadActivities().then(function () {
                                if(success) { success(result); }
                            });
                        }, function (err) {
                            if(error) { error(err); }
                        });
                    }
                },
                getActivityPlans: function (options) {
                    if (UserService.principal.isAuthenticated()) {
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
                    if (UserService.principal.isAuthenticated()) {
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
                        return Restangular.restangularizeElement(null, plan, "activityplans").put();
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

    ; // module


}());
