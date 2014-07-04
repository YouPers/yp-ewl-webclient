(function () {
    'use strict';


    angular.module('yp.components.socialInteraction')


        .factory("SocialInteractionService", ['ErrorService', 'Restangular',
            function (ErrorService, Rest) {

                var socialInteractions = Rest.all('socialInteractions');

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
                        return socialInteractions.getList(options).then(function(socialInteractions) {
                            return socialInteractions;
                        });
                    },
                    deleteSocialInteraction: function(socialInteractionId) {
                        return socialInteractions.one(socialInteractionId).remove();
                    }
                };
                return SocialInteractionService;
            }]);
}());
