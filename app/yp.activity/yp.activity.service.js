(function () {
    'use strict';

    angular.module('yp.activity')


        .factory('ActivityService', ['$http', 'Restangular', '$q', 'UserService', '$rootScope',
            function ($http, Restangular, $q, UserService, $rootScope) {
                var activities = Restangular.all('activities');
                var activityPlans = Restangular.all('activityplans');

                var cachedActivitiesPromise;
                var cachedRecommendationsPromises = {};

                $rootScope.$on('$translateChangeStart', function () {
                    actService.reloadActivities();
                });

                $rootScope.$on('newAssessmentResultsPosted', function (assResult) {
                    actService.invalidateRecommendations();
                });

                $rootScope.$on('event:authority-deauthorized', function () {
                    actService.reloadActivities();
                });

                $rootScope.$on('event:authority-authorized', function () {
                    actService.reloadActivities();
                });

                var actService = {
                    getActivities: function (params) {
                        // we can no longer assume, that activities are static because campaign leads can create new campaign
                        // activities during a session, therefore we cache it on the client only for the full list of activities
                        // and not for filtered subsets

                        if (params) {
                            // we do not use the cached activity list
                            params.limit = 1000;
                            return activities.getList(params);
                        } else {
                            params = {};
                            params.limit = 1000;
                            if (!cachedActivitiesPromise) {
                                cachedActivitiesPromise = activities.getList(params);
                            }
                            return cachedActivitiesPromise;
                        }
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
                    saveActivity: function (activity) {
                        if (activity.id) {
                            return activity.put().then(function (result) {
                                return actService.reloadActivities();
                            });
                        } else {
                            return activity.post().then(function (result) {
                                return actService.reloadActivities();
                            });
                        }
                    },
                    getActivityPlan: function (activityPlanId) {
                        return Restangular.one('activityplans', activityPlanId).get({'populate': ['owner', 'invitedBy', 'joiningUsers', 'activity']});
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
                                var reason = 'only one plan expected per activity and user';
                                $rootScope.$emit('clientmsg:error', reason);
                                $q.reject(reason);
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
                        if (UserService.principal.isAuthenticated()) {
                            if (!cachedRecommendationsPromises[focusQuestionId || 'default']) {
                                cachedRecommendationsPromises[focusQuestionId || 'default'] =
                                    Restangular.all('activityoffers/coach').getList(params);
                            }
                            return cachedRecommendationsPromises[focusQuestionId || 'default'];
                        } else {
                            return [];
                        }

                    },
                    getActivityOffers: function (options) {
                        return Restangular.all('activityoffers').getList(options);
                    },
                    getActivityOffer: function (id) {
                        return Restangular.one('activityoffers', id).get({
                            'populate': 'activity activityPlan recommendedBy',
                            'populatedeep': 'activityPlan.owner'
                        });
                    },
                    saveActivityOffer: function (offer) {
                        var plan = offer.activityPlan[0];

                        function _saveActivityOffer(offer) {
                            if (offer.id) {
                                return Restangular.restangularizeElement(null, offer, "activityoffers").put();
                            } else {
                                return Restangular.all('activityoffers').post(offer);
                            }
                        }

                        if (offer.type[0] === 'campaignActivityPlan') {
                            // an event is being scheduled or edited, so we first save the plan
                            return this.savePlan(plan)
                                .then(function (savedPlan) {
                                    offer.activityPlan = [savedPlan.id];
                                    _saveActivityOffer(offer);
                                });
                        } else if (offer.type[0] === 'campaignActivity') {
                            // no event, so just save the offer.
                            offer.activityPlan = [];
                            return _saveActivityOffer(offer);
                        } else {
                            throw new Error('should never arrive here');
                        }
                    },
                    invalidateRecommendations: function () {
                        cachedRecommendationsPromises = {};
                    },
                    joinPlan: function (plan) {
                        return activityPlans.one(plan.id).all('/join').post();
                    },
                    savePlan: function (plan) {
                        if (plan.id) {
                            return Restangular.restangularizeElement(null, plan, "activityplans").put();
                        } else {
                            return activityPlans.post(plan);
                        }
                    },
                    deletePlan: function (plan) {
                        return activityPlans.one(plan.id).remove();
                    },
                    deleteOffer: function (offer) {
                        if (offer.plan && offer.plan.id) {
                            // if this is an offer with a saved plan, then we delete the plan
                            // the backend will cascade delete the offer automafically
                            return activityPlans.one(offer.plan.id).delete();
                        } else {
                            // if this is an offer without plan, we just delete the offer
                            return Restangular.one('activityoffers', offer.id).delete();
                        }
                    },
                    updateActivityEvent: function (planId, actEvent) {
                        return Restangular.restangularizeElement(null, actEvent, 'activityplans/' + planId + '/events').put();
                    },
                    inviteEmailToJoinPlan: function (email, plan) {
                        return activityPlans.one(plan.id).all('/inviteEmail').post({email: email});
                    },

                    getDefaultPlan: function (activity, campaignId) {

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

                        var plan =  {
                            activity: activity,
                            status: 'active',
                            mainEvent: newMainEvent,
                            source: campaignId ? 'campaign': 'community',
                            executionType: activity.defaultexecutiontype,
                            visibility: activity.defaultvisibility,
                            fields: activity.fields,
                            topics: activity.topics,
                            title: activity.title,
                            number: activity.number
                        };
                        if (campaignId) {
                            plan.campaign = campaignId;
                        }
                        return plan;
                    }
                };

                return actService;
            }]);

}());