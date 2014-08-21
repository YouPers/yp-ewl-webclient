(function () {

    'use strict';

    angular.module('yp.components.socialInteraction')
        .directive('socialInteraction', ['$rootScope', '$state', '$stateParams', 'accessLevels', 'UserService', 'SocialInteractionService',
            function ($rootScope, $state, $stateParams, accessLevels, UserService, SocialInteractionService) {
                return {
                    restrict: 'E',
                    scope: {},
                    templateUrl: 'components/social-interaction/social-interaction-directive.html',

                    link: function (scope, elem, attrs) {

                        var options = scope.options = {};


                        var user = UserService.principal.getUser();
                        options.isCampaignLead = _.contains(user.roles, 'campaignlead');

                        var messageTemplate = {
                            author: user.id,
                            authorType: 'campaignLead',

                            targetSpaces: [{
                                type: 'campaign',
                                targetId: $stateParams.campaignId
                            }],

                            publishFrom: new Date(moment().startOf('day')),
                            publishTo: new Date(moment().endOf('day'))
                        };
                        scope.message = _.clone(messageTemplate);

                        if ($rootScope.principal.isAuthenticated()) {
                            SocialInteractionService.getMessages({ populate: 'author' }).then(function (messages) {
                                scope.socialInteractions = messages;
                            });
                        }

                        scope.saveMessage = function saveMessage() {
                            SocialInteractionService.postMessage(scope.message).then(function() {
                                scope.socialInteractions.unshift(scope.message);
                                scope.message = _.clone(messageTemplate);
                                scope.options.composeMessage = false;
                            });
                        };

                        scope.dismissSocialInteraction = function dismissSocialInteraction(socialInteraction) {
                            SocialInteractionService.deleteSocialInteraction(socialInteraction.id);
                            _.remove(scope.socialInteractions, { id: socialInteraction.id });
                        };

                    }
                };
            }]);

}());