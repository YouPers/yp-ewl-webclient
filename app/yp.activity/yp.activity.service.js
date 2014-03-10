(function () {
    'use strict';

    angular.module('yp.activity')


        .factory('ActivityService', ['$http', 'Restangular', '$q', 'UserService', '$rootScope', 'ErrorService',
            function ($http, Restangular, $q, UserService, $rootScope, ErrorService) {
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
                        // we can no longer assume, that activities are static because campaign leads can create new campaign
                        // activities during a session, therefore we cache it on the client only for the full list of activities
                        // and not for filtered subsets

                        if (params) {
                            // we do not use the cached activity list
                            params.limit = 1000;
                            return activities.getList(params).catch(ErrorService.defaultErrorCallback);
                        } else {
                            params = {};
                            params.limit = 1000;
                            if (!cachedActivitiesPromise) {
                                cachedActivitiesPromise = activities.getList(params).catch(ErrorService.defaultErrorCallback);
                            }
                            return cachedActivitiesPromise;
                        }
                    },
                    reloadActivities: function () {
                        cachedActivitiesPromise = activities.getList({limit: 1000}).catch(ErrorService.defaultErrorCallback);
                        cachedRecommendationsPromises = {};
                        return cachedActivitiesPromise;
                    },
                    getActivity: function (activityId) {
                        if (activityId) {
                            return Restangular.one('activities', activityId).get().catch(ErrorService.defaultErrorCallback);
                        } else {
                            var deferred = $q.defer();
                            deferred.resolve(null);
                            return deferred.promise;
                        }
                    },
                    saveActivity: function(activity) {
                        if (activity.id) {
                            activity.put().then(function (result) {
                                return actService.reloadActivities();
                            }, ErrorService.defaultErrorCallback());
                        } else {
                            activity.post().then(function (result) {
                                return actService.reloadActivities();
                            }, ErrorService.defaultErrorCallback());
                        }
                    },
                    getActivityPlans: function (options) {
                        if (UserService.principal.isAuthenticated()) {
                            return activityPlans.getList(options).catch(ErrorService.defaultErrorCallback);
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
                        return Restangular.all('activityplans/joinOffers').getList(params).catch(ErrorService.defaultErrorCallback);
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
                                $rootScope.$emit('notification:error', reason);
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
                            var cachedRecommendationsPromise = cachedRecommendationsPromises[focusQuestionId || 'default'];
                            if (!cachedRecommendationsPromise) {
                                cachedRecommendationsPromises[focusQuestionId || 'default'] =
                                    Restangular.all('activities/recommendations').getList(params).catch(ErrorService.defaultErrorCallback);
                            }
                            return cachedRecommendationsPromise;
                        } else {
                            return [];
                        }

                    },
                    invalidateRecommendations: function () {
                        cachedRecommendationsPromises = {};
                    },
                    savePlan: function (plan) {
                        if (plan.id) {
                            return Restangular.restangularizeElement(null, plan, "activityplans").put().catch(ErrorService.defaultErrorCallback);
                        } else {
                            return activityPlans.post(plan).catch(ErrorService.defaultErrorCallback);
                        }
                    },
                    deletePlan: function (plan) {
                        return activityPlans.one(plan.id).remove().catch(ErrorService.defaultErrorCallback);
                    },
                    updateActivityEvent: function (planId, actEvent) {
                        return Restangular.restangularizeElement(null, actEvent, 'activityplans/' + planId + '/events').put().catch(ErrorService.defaultErrorCallback);
                    },
                    inviteEmailToJoinPlan: function (email, plan) {
                        return activityPlans.one(plan.id).all('/inviteEmail').post({email: email}).catch(ErrorService.defaultErrorCallback);
                    }
                };

                return actService;
            }]);

}());