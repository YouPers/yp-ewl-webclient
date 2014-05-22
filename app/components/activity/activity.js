(function () {
    'use strict';

    angular.module('yp.components.activity', ['restangular', 'ui.router', 'yp.user'])


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
