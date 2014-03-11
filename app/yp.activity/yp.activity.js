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



    ; // module


}());
