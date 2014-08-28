(function () {
    'use strict';

    angular.module('yp.components.activity')

        .factory('ActivityService', ['$http', 'Restangular', '$q', 'UserService', '$rootScope',
            function ($http, Restangular, $q, UserService, $rootScope) {
                var ideas = Restangular.all('ideas');
                var activities = Restangular.all('activities');
                var activityEvents = Restangular.all('activityevents');

                var ideaCache = {};

                var _populateIdeas = function (object) {
                    // make it work for arrays and single objects
                    var objects = Array.isArray(object) ? object : [object];

                    // determine whether we need to fetch anything from server
                    var ideaIdsToFetch = [];
                    _.forEach(objects, function (obj) {
                        if (obj.idea && !_.isObject(obj.idea) && !ideaCache[obj.idea]) {
                            ideaIdsToFetch.push(obj.idea);
                        }
                    });

                    /**
                     * populate objects synchronously from Cache, assumes that all needed objects are in the cache
                     * @returns {*}
                     * @private
                     */
                    function _populateFromCache () {
                        _.forEach(objects, function(obj) {
                            if (obj.idea && !_.isObject(obj.idea)) {
                                obj.idea = ideaCache[obj.idea];
                            }
                        });

                        // when we first got an array we return array, otherwise object
                        if (Array.isArray(object)) {
                            return objects;
                        } else {
                            return objects[0];
                        }
                    }

                    if (ideaIdsToFetch.length > 0) {
                        // some ideas have to be fetched from server
                        var options = {};
                        options['filter[id]'] = ideaIdsToFetch.join(',');
                        return ideas.getList(options).then(function (ideas) {
                            _.forEach(ideas, function (idea) {
                                ideaCache[idea.id] = idea;
                            });
                        }).then(_populateFromCache);
                    } else {
                        // all ideas already on client
                        var deferred = $q.defer();

                        deferred.resolve(_populateFromCache());
                        return deferred.promise;
                    }
                };

                var actService = {
                    getIdeas: function (params) {
                        if (!params) {
                            params = {};
                        }

                        params.limit = 1000;
                        return ideas.getList(params);
                    },
                    getIdea: function (ideaId) {
                        if (ideaId) {
                            return Restangular.one('ideas', ideaId).get();
                        } else {
                            var deferred = $q.defer();
                            deferred.resolve(null);
                            return deferred.promise;
                        }
                    },
                    saveIdea: function (idea) {
                        if (idea.id) {
                            return idea.put();
                        } else {
                            return Restangular.restangularizeElement(null, idea, 'ideas').post();
                        }
                    },
                    getActivity: function (activityId) {
                        return Restangular.one('activities', activityId).get({'populate': ['owner', 'invitedBy', 'joiningUsers']})
                            .then(_populateIdeas);
                    },
                    getActivities: function (options) {
                        if (UserService.principal.isAuthenticated()) {

                            return activities.getList(options).then(_populateIdeas);
                        } else {
                            var deferred = $q.defer();
                            deferred.resolve([]);
                            return deferred.promise;
                        }
                    },
                    getActivityEvents: function (options) {
                        if (UserService.principal.isAuthenticated()) {
                            return activityEvents.getList(options).then(_populateIdeas);
                        } else {
                            var deferred = $q.defer();
                            deferred.resolve([]);
                            return deferred.promise;
                        }
                    },
                    getRecommendations: function (topicId) {
                        var params = {
                            limit: 1000,
                            topic: topicId
                        };

                        if (UserService.principal.isAuthenticated()) {
                            return Restangular.all('coachRecommendations').getList(params);
                        } else {
                            return [];
                        }

                    },
                    getActivityOffers: function (options) {
                        return Restangular.all('activityoffers').getList(options);
                    },
                    getActivityOffer: function (id) {
                        return Restangular.one('activityoffers', id).get({
                            'populate': 'idea activity recommendedBy',
                            'populatedeep': 'activity.owner activity.joiningUsers'
                        });
                    },
                    saveActivityOffer: function (offer) {
                        var plan = offer.activity[0];

                        function _saveActivityOffer(offer) {
                            if (offer.id) {
                                return Restangular.restangularizeElement(null, offer, "activityoffers").put();
                            } else {
                                return Restangular.all('activityoffers').post(offer);
                            }
                        }

                        if (offer.offerType[0] === 'campaignActivityPlan') {
                            // an event is being scheduled or edited, so we first save the plan
                            return this.savePlan(plan)
                                .then(function (savedPlan) {
                                    offer.activity = [savedPlan];
                                    return _saveActivityOffer(offer);
                                });
                        } else if (offer.offerType[0] === 'campaignActivity') {
                            // no event, so just save the offer.
                            offer.activity = [];
                            return _saveActivityOffer(offer);
                        } else {
                            throw new Error('should never arrive here');
                        }
                    },
                    joinPlan: function (plan) {
                        return activities.one(plan.id).all('/join').post();
                    },
                    savePlan: function (plan) {
                        if (plan.id) {
                            return Restangular.restangularizeElement(null, plan, "activities").put();
                        } else {
                            return activities.post(plan);
                        }
                    },
                    deletePlan: function (plan) {
                        return activities.one(plan.id).remove();
                    },
                    deleteOffer: function (offer) {
                        if (offer.plan && offer.plan.id) {
                            // if this is an offer with a saved plan, then we delete the plan
                            // the backend will cascade delete the offer automafically
                            return activities.one(offer.plan.id).remove();
                        } else {
                            // if this is an offer without plan, we just delete the offer
                            return Restangular.one('activityoffers', offer.id).remove();
                        }
                    },
                    updateActivityEvent: function (actEvent) {
                        return actEvent.put();
                    },
                    inviteEmailToJoinPlan: function (email, plan) {
                        return activities.one(plan.id).all('/inviteEmail').post({email: email});
                    },
                    validateActivity: function (activity) {
                        return Restangular.all('activities/validate').post(activity);
                    },
                    getInvitationStatus: function(activityId) {
                        return Restangular.one('activities', activityId).one('invitationStatus').getList();
                    },


                    getDefaultActivity: function (idea, options) {
                        return ideas.one(idea.id || idea).one('defaultActivity').get(options).then(_populateIdeas);
                    },

                    getDefaultPlan: function (idea, campaignId) {
                        var now = moment();
                        var newMainEvent = {
                            "allDay": false
                        };
                        var duration = idea.defaultduration ? idea.defaultduration : 60;
                        if (idea.defaultfrequency === 'week') {
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
                        } else if (idea.defaultfrequency === 'day') {
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
                            newMainEvent.start = moment(now).add('d', 1).startOf('hour').toDate();
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

                        var plan = {
                            idea: idea,
                            status: 'active',
                            mainEvent: newMainEvent,
                            source: campaignId ? 'campaign' : 'community',
                            executionType: idea.defaultexecutiontype,
                            visibility: campaignId ? 'campaign' : idea.defaultvisibility,
                            fields: idea.fields,
                            topics: idea.topics,
                            title: idea.title,
                            number: idea.number
                        };

                        if (campaignId) {
                            plan.campaign = campaignId;
                        }
                        return plan;
                    }
                };

                return actService;
            }
        ])
    ;


}
()
    )
;
