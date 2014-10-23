(function () {
    'use strict';


    angular.module('yp.components.socialInteraction')


        .factory("SocialInteractionService", ['ErrorService', 'Restangular',
            function (ErrorService, Rest) {

                var socialInteractions = Rest.all('socialInteractions');
                var recommendations = Rest.all('recommendations');
                var invitations = Rest.all('invitations');
                var messages = Rest.all('messages');
                var offers = Rest.all('offers');

                function extractRefDocs(results) {
                    _.forEach(results, function (result) {
                        _.forEach(result.refDocs, function (refDoc) {
                            if(refDoc.doc) {
                                if(refDoc.model === 'Idea') {
                                    result.idea = refDoc.doc;
                                } else if(refDoc.model === 'Activity') {
                                    result.activity = refDoc.doc;
                                    result.idea = refDoc.doc.idea;
                                }
                            }
                        });
                    });
                    return results;
                }

                var SocialInteractionService = {

                    putSocialInteraction: function(socialInteraction) {
                        if (socialInteraction.idea && socialInteraction.idea.id) {
                            socialInteraction.idea = socialInteraction.idea.id;
                        }
                        return Rest.restangularizeElement(null, socialInteraction, "socialInteractions").put();
                    },
                    postSocialInteraction: function(socialInteraction) {
                        // fix for publishFrom if publishFrom is today, because otherwise it looks as if the
                        // Message was written this morning at midnight
                        if (moment(socialInteraction.publishFrom).isBefore(moment())) {
                            socialInteraction.publishFrom = new Date();
                        }
                        return socialInteractions.post(socialInteraction);
                    },
                    getSocialInteraction: function(socialInteractionId) {
                        return socialInteractions.one(socialInteractionId).get({ 'populate': ['author'] }).then(function (invitation) {
                            extractRefDocs([invitation]);
                            return invitation;
                        });
                    },
                    getSocialInteractions: function(options) {
                        return socialInteractions.getList(options).then(function(results) {
                            return extractRefDocs(results);
                        });
                    },
                    deleteSocialInteraction: function(socialInteractionId, options) {
                        return socialInteractions.one(socialInteractionId).remove(options);
                    },

                    getRecommendations: function(options) {
                        return recommendations.getList(options);
                    },
                    postRecommendation: function(recommendation) {
                        // fix for publishFrom if publishFrom is today, because otherwise it looks as if the
                        // Message was written this morning at midnight
                        if (moment(recommendation.publishFrom).isBefore(moment())) {
                            recommendation.publishFrom = new Date();
                        }
                        return recommendations.post(recommendation);
                    },

                    getInvitations: function(options) {
                        return invitations.getList(options).then(function(results) {
                            return extractRefDocs(results);
                        });
                    },
                    postInvitation: function(invitation) {
                        // fix for publishFrom if publishFrom is today, because otherwise it looks as if the
                        // Message was written this morning at midnight
                        if (moment(invitation.publishFrom).isBefore(moment())) {
                            invitation.publishFrom = new Date();
                        }
                        return invitations.post(invitation);
                    },

                    getMessages: function(options) {
                        return messages.getList(options);
                    },
                    postMessage: function(message) {
                        // fix for publishFrom if publishFrom is today, because otherwise it looks as if the
                        // Message was written this morning at midnight
                        if (moment(message.publishFrom).isBefore(moment())) {
                            message.publishFrom = new Date();
                        }
                        return messages.post(message);
                    },

                    getOffers: function(options) {
                        return offers.getList(options).then(function(results) {
                            return extractRefDocs(results);
                        });
                    }
                };
                return SocialInteractionService;
            }]);
}());
