(function () {
    'use strict';


    angular.module('yp.components.socialInteraction')


        .factory("SocialInteractionService", ['ErrorService', 'Restangular',
            function (ErrorService, Rest) {

                var socialInteractions = Rest.all('socialInteractions');
                var recommendations = Rest.all('recommendations');
                var invitations = Rest.all('invitations');
                var messages = Rest.all('messages');

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
                        return socialInteraction.put();
                    },
                    postSocialInteraction: function(socialInteraction) {
                        return socialInteractions.post(socialInteraction);
                    },
                    getSocialInteraction: function(socialInteractionId) {
                        return socialInteractions.one(socialInteractionId);
                    },
                    getSocialInteractions: function(options) {
                        return socialInteractions.getList(options).then(function(results) {
                            return extractRefDocs(results);
                        });
                    },
                    deleteSocialInteraction: function(socialInteractionId) {
                        return socialInteractions.one(socialInteractionId).remove();
                    },

                    getRecommendations: function(options) {
                        return recommendations.getList(options);
                    },
                    postRecommendation: function(recommendation) {
                        return recommendations.post(recommendation);
                    },

                    getInvitations: function(options) {
                        return invitations.getList(options).then(function(results) {
                            return extractRefDocs(results);
                        });
                    },
                    postInvitation: function(invitation) {
                        return invitations.post(invitation);
                    },

                    getMessages: function(options) {
                        return messages.getList(options);
                    },
                    postMessage: function(message) {
                        return messages.post(message);
                    }
                };
                return SocialInteractionService;
            }]);
}());
