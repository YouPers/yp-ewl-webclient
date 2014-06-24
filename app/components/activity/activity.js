(function () {
    'use strict';

    angular.module('yp.components.activity', ['yp.components.user'])

        .run(['Restangular', 'ActivityService', function (Restangular, ActivityService) {

            Restangular.extendCollection('ideas', function (ideas) {
                    ideas.enrichWithUserData = function (plans, recommendations, campaigns, prefs) {
                        _.forEach(ideas, function (idea) {

                            var matchingPlan = _.find(plans, function (plan) {
                                return (idea.id === plan.idea);
                            });

                            idea.plan = matchingPlan;
                            idea.isCampaign = (campaigns.indexOf(idea.campaign) !== -1);
                            if (_.any(prefs.starredIdeas,function(starred) {
                                return starred.idea === idea.id;
                            })) {
                                idea.starred = true;
                            }

                            if (_.any(prefs.rejectedIdeas,function(rejected) {
                                return rejected.idea === idea.id;
                            })) {
                                idea.rejected = true;
                            }

                            var rec = _.find(recommendations, {'idea': idea.id});
                            if (rec) {
                                idea.isRecommended = true;
                                idea.score = rec.score;
                            } else {
                                delete idea.isRecommended;
                                delete idea.score;
                            }
                        });
                    };

                    ideas.byId = function(id) {
                        return _.find(ideas, function(act) {
                            return act.id === id;
                        });
                    };

                    return ideas;
                }
            );

            var extendIdeas = function (idea) {

                idea.getDefaultPlan = function () {
                    return ActivityService.getDefaultPlan(idea);
                };

                idea.getRecWeightsByQuestionId = function () {
                    var byId = {};
                    _.forEach(idea.recWeights, function (obj) {
                        byId[obj[0]] = obj;
                    });
                    return byId;
                };

                return idea;
            };
            Restangular.extendModel('ideas', extendIdeas);

        }]);

})();