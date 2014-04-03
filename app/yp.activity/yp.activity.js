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
                                return AssessmentService.topStressors('525faf0ac558d40000000005');
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

                $translateWtiPartialLoaderProvider.addPart('yp.activity/yp.activity');


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
        .run(['Restangular', 'ActivityService', function (Restangular, ActivityService) {
            Restangular.extendCollection('activities', function (activities) {
                    activities.enrichWithUserData = function (plans, recommendations, campaigns, userPreferences) {
                        _.forEach(activities, function (act) {

                            var matchingPlan = _.find(plans, function (plan) {
                                return (act.id === plan.activity);
                            });

                            act.plan = matchingPlan;
                            act.isCampaign = (campaigns.indexOf(act.campaign) !== -1);
                            if (_.any(userPreferences.starredActivities,function(starred) {
                                return starred.activity === act.id;
                            })) {
                                act.starred = true;
                            }

                            if (_.any(userPreferences.rejectedActivities,function(rejected) {
                                return rejected.activity === act.id;
                            })) {
                                act.rejected = true;
                            }

                            var rec = _.find(recommendations, {'activity': act.id});
                            if (rec) {
                                act.isRecommended = true;
                                act.score = rec.score;
                            } else {
                                delete act.isRecommended;
                                delete act.score;
                            }
                        });
                    };

                    activities.byId = function(id) {
                        return _.find(activities, function(act) {
                            return act.id === id;
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

            var extendActivities = function (activity) {

                activity.getDefaultPlan = function () {
                    return ActivityService.getDefaultPlan(activity);
                };

                activity.getRecWeightsByQuestionId = function () {
                    var byId = {};
                    _.forEach(activity.recWeights, function (obj) {
                        byId[obj[0]] = obj;
                    });
                    return byId;
                };

                return activity;
            };
            Restangular.extendModel('activities', extendActivities);

        }])



    ; // module


}());
