(function () {

    'use strict';

    angular.module('yp.components.socialInteraction')
        .directive('socialInteractionInbox', ['$rootScope', '$state', '$stateParams', 'accessLevels', 'UserService', 'SocialInteractionService',
            function ($rootScope, $state, $stateParams, accessLevels, UserService, SocialInteractionService) {
                return {
                    restrict: 'E',
                    scope: {},
                    templateUrl: 'components/social-interaction/social-interaction-inbox-directive.html',

                    link: function (scope, elem, attrs) {

                        var options = scope.options = {};


                        var user = UserService.principal.getUser();
                        options.isCampaignLead = _.contains(user.roles, 'campaignlead');

                        scope.soiRemoved = function (soi) {
                            _.remove(scope.socialInteractions, { id: soi.id });
                        };

                        if ($rootScope.principal.isAuthenticated()) {
                            var params = {
                                targetId: $stateParams.campaignId,
                                populate: 'author',
                                limit: 10
                            };
                            if ($state.current.name.indexOf('dcm') === 0) {
                                params.authored = true;
                            }
                            SocialInteractionService.getSocialInteractions(params).then(function (socialInteractions) {

                                socialInteractions = _.filter(socialInteractions, function (si) {
                                    return si.authorType !== 'coach';
                                });

                                socialInteractions = _.sortBy(socialInteractions, function (si) {
                                    return new Date(si.publishFrom || si.created).getTime();
                                }).reverse();

                                _.each(socialInteractions, function (si) {
                                    if (si.__t !== 'Message') {
                                        si.idea = si.idea || si.activity.idea;
                                    }
                                });

                                scope.socialInteractions = socialInteractions;
                            });
                        }
                    }
                };
            }])

        .directive('socialInteraction', ['$rootScope', '$state', '$stateParams', 'accessLevels', 'UserService', 'SocialInteractionService',
            function ($rootScope, $state, $stateParams, accessLevels, UserService, SocialInteractionService) {
                return {
                    restrict: 'E',
                    scope: {
                        soi: '=',
                        onRemove: '&'
                    },
                    templateUrl: 'components/social-interaction/social-interaction-directive.html',

                    link: function (scope, elem, attrs) {
                        var user = UserService.principal.getUser();
                        var options = scope.options = {};
                        options.isCampaignLead = _.contains(user.roles, 'campaignlead');

                        scope.componentClass = function (socialInteraction) {
                            var authorType = socialInteraction.authorType;
                            return 'offer' + authorType.charAt(0).toUpperCase() + authorType.slice(1);

                        };

                        scope.dismissSocialInteraction = function dismissSocialInteraction($event, socialInteraction) {
                            $event.stopPropagation();
                            var deleteOptions = {
                                mode: options.isCampaignLead ? 'administrate' : 'normal'
                            };

                            SocialInteractionService.deleteSocialInteraction(socialInteraction.id, deleteOptions);
                            if (scope.onRemove) {
                                scope.onRemove({socialInteraction: socialInteraction});
                            }
                        };

                        scope.openSocialInteraction = function (socialInteraction) {

                            if (options.isCampaignLead && socialInteraction.__t === 'Recommendation') {
                                $state.go('dcm.recommendation', {
                                    idea: socialInteraction.idea.id,
                                    socialInteraction: socialInteraction.id
                                });
                            } else if (socialInteraction.idea) {

                                $state.go((options.isCampaignLead ? 'dcm' : 'dhc') + '.activity', {
                                    campaignId: $stateParams.campaignId,
                                    idea: socialInteraction.idea ? socialInteraction.idea.id : undefined,
                                    activity: socialInteraction.activity ? socialInteraction.activity.id : undefined,
                                    socialInteraction: socialInteraction.id,
                                    mode: options.isCampaignLead ? 'campaignlead' : undefined
                                });
                            }

                        };

                    }
                };
            }])

        .directive('socialInteractionMessageComposer', ['$rootScope', '$state', '$stateParams', 'accessLevels', 'UserService', 'SocialInteractionService',
            function ($rootScope, $state, $stateParams, accessLevels, UserService, SocialInteractionService) {
                return {
                    restrict: 'E',
                    scope: {
                        onPost: '&'
                    },
                    templateUrl: 'components/social-interaction/social-interaction-message-compose-directive.html',

                    link: function (scope, elem, attrs) {
                        var messageTemplate = {
                            author: UserService.principal.getUser(),
                            authorType: 'campaignLead',

                            targetSpaces: [
                                {
                                    type: 'campaign',
                                    targetId: $stateParams.campaignId
                                }
                            ],

                            __t: 'Message',

                            publishFrom: new Date(moment().startOf('day')),
                            publishTo: new Date(moment().endOf('day'))
                        };

                        scope.options = {
                            composeFormShown: false
                        };

                        scope.message = _.clone(messageTemplate);

                        scope.saveMessage = function saveMessage(message) {
                            SocialInteractionService.postMessage(message).then(function (saved) {
                                saved.author = $rootScope.principal.getUser();
                                if (scope.onPost && _.isFunction(scope.onPost)) {
                                    scope.onPost({message: message});
                                }
                                scope.message = _.clone(messageTemplate);
                                scope.options.composeFormShown = false;
                            });
                        };
                    }
                };
            }]);
}());