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
                            author: user,
                            authorType: 'campaignLead',

                            targetSpaces: [{
                                type: 'campaign',
                                targetId: $stateParams.campaignId
                            }],

                            __t: 'Message',

                            publishFrom: new Date(moment().startOf('day')),
                            publishTo: new Date(moment().endOf('day'))
                        };

                        scope.componentClass = function (socialInteraction) {
                            var authorType = socialInteraction.authorType;
                            return 'offer' + authorType.charAt(0).toUpperCase() + authorType.slice(1);

                        };

                        scope.message = _.clone(messageTemplate);

                        if ($rootScope.principal.isAuthenticated()) {
                            var params = {
                                targetId: $stateParams.campaignId,
                                populate: 'author',
                                limit: 10
                            };
                            if($state.current.name.indexOf('dcm') === 0) {
                                params.authored = true;
                            }
                            SocialInteractionService.getSocialInteractions(params).then(function (socialInteractions) {

                                socialInteractions = _.filter(socialInteractions, function (si) {
                                    return si.__t === 'Invitation' || si.__t === 'Message';
                                });

                                socialInteractions = _.sortBy(socialInteractions, function(si) {
                                    return new Date(si.publishFrom || si.created).getTime();
                                }).reverse();

                                _.each(socialInteractions, function (si) {
                                    if(si.__t !== 'Message') {
                                        si.idea = si.idea || si.activity.idea;
                                    }
                                });

                                scope.socialInteractions = socialInteractions;
                            });
                        }

                        scope.saveMessage = function saveMessage() {
                            SocialInteractionService.postMessage(scope.message).then(function() {
                                scope.socialInteractions.push(scope.message);
                                scope.message = _.clone(messageTemplate);
                                scope.options.composeMessage = false;
                            });
                        };

                        scope.openSocialInteraction = function (socialInteraction) {

                            if(socialInteraction.idea) {

                                $state.go((options.isCampaignLead ? 'dcm' : 'dhc') + '.activity', {
                                    campaignId: $stateParams.campaignId,
                                    idea: socialInteraction.idea ? socialInteraction.idea.id : undefined,
                                    activity: socialInteraction.activity ? socialInteraction.activity.id : undefined,
                                    socialInteraction: socialInteraction.id,
                                    mode: options.isCampaignLead ? 'campaignlead' : undefined
                                });
                            }

                        };

                        scope.dismissSocialInteraction = function dismissSocialInteraction($event, socialInteraction) {
                            $event.stopPropagation();
                            SocialInteractionService.deleteSocialInteraction(socialInteraction.id);
                            _.remove(scope.socialInteractions, { id: socialInteraction.id });
                        };

                    }
                };
            }]);

}());