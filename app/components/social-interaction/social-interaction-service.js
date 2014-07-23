(function () {
    'use strict';


    angular.module('yp.components.socialInteraction')


        .factory("SocialInteractionService", ['ErrorService', 'Restangular',
            function (ErrorService, Rest) {

                var socialInteractions = Rest.all('socialInteractions');
                var recommendations = Rest.all('recommendations');
                var invitations = Rest.all('invitations');
                var messages = Rest.all('messages');

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
                            _.forEach(results, function (result) {
                                _.forEach(result.refDocs, function (refDoc) {
                                    if(refDoc.doc) {
                                        result[refDoc.model.toLowerCase()] = refDoc.doc;
                                    }
                                });
                            });
                            return results;
                        });
                    },
                    deleteSocialInteraction: function(socialInteractionId) {
                        return socialInteractions.one(socialInteractionId).remove();
                    },
                    getRecommendations: function(options) {
                        return recommendations.getList(options);
                    },
                    getInvitations: function(options) {
                        return invitations.getList(options);
                    },
                    getMessages: function(options) {
                        return messages.getList(options);
                    }
                };
                return SocialInteractionService;
            }]);
}());
