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

                        scope.soiRemoved = function (soi) {
                            _.remove(scope.socialInteractions, { id: soi.id });
                        };

                        // only load data if user is authenticated and we have loaded the campaign

                        if ($rootScope.principal.isAuthenticated() && $stateParams.campaignId) {
                            var params = {
                                populate: 'author idea activity',
                                limit: 10
                            };

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
                        onRemove: '&',
                        onEdit: '&'
                    },
                    templateUrl: 'components/social-interaction/social-interaction-directive.html',

                    link: function (scope, elem, attrs) {
                        var user = UserService.principal.getUser();
                        var options = scope.options = {};
                        options.isCampaignLead = _.contains(user.roles, 'campaignlead');

                        scope.componentClass = function (socialInteraction) {
                            if(!socialInteraction) {
                                return undefined;
                            }
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

                        scope.editSocialInteraction = function ($event, socialInteraction) {
                            socialInteraction._editMode = true;
                            if (scope.onEdit) {
                                scope.onEdit({socialInteraction: socialInteraction});
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
                            } else {
                                // sois that cannot be opened come here and do Nothing!
                                // e.g. Messages
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
                        onPost: '&',
                        editedMessage: '='
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

                        scope.hasCampaign = $stateParams.campaignId;

                        scope.options = {
                            composeFormShown: false
                        };

                        scope.$watch('editedMessage', function (newVal, oldVal) {
                            if (newVal) {
                                scope.message = newVal;
                                scope.options.composeFormShown = true;
                            }
                        });


                        if (!scope.message) {
                            scope.message = _.clone(messageTemplate);
                        }

                        scope.cancel = function (message) {
                            delete message._editMode;
                            scope.options.composeFormShown = false;
                            scope.message = _.clone(messageTemplate);
                            scope.editedMessage = null;
                        };

                        scope.saveMessage = function saveMessage(message) {



                            if (message.id) {
                                SocialInteractionService.putSocialInteraction(message).then(function (saved) {
                                    saved.author = $rootScope.principal.getUser();
                                    delete message._editMode;
                                    _.merge(message, saved);
                                    scope.options.composeFormShown = false;
                                    scope.message = _.clone(messageTemplate);
                                    scope.editedMessage = null;
                                });

                            } else {
                                SocialInteractionService.postMessage(message).then(function (saved) {
                                    saved.author = $rootScope.principal.getUser();
                                    if (scope.onPost && _.isFunction(scope.onPost)) {
                                        scope.onPost({message: saved});
                                    }
                                    scope.message = _.clone(messageTemplate);
                                    scope.options.composeFormShown = false;
                                });
                            }
                        };
                    }
                };
            }]);
}());