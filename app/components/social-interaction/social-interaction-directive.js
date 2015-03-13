(function () {

    'use strict';

    angular.module('yp.components.socialInteraction')
        .directive('socialInteractionInbox', ['$rootScope', '$state', '$stateParams', 'accessLevels', 'UserService', 'ActivityService', 'SocialInteractionService',
            function ($rootScope, $state, $stateParams, accessLevels, UserService, ActivityService, SocialInteractionService) {
                return {
                    restrict: 'E',
                    scope: {},
                    templateUrl: 'components/social-interaction/social-interaction-inbox-directive.html',

                    link: function (scope, elem, attrs) {

                        scope.soiRemoved = function (soi) {
                            _.remove(scope.socialInteractions, {id: soi.id});
                        };

                        // only load data if user is authenticated and we have loaded the campaign

                        if ($rootScope.principal.isAuthenticated() && $stateParams.campaignId) {
                            var params = {
                                populate: 'author activity',
                                limit: 10,
                                sort: 'publishFrom:-1',
                                "filter[authorType]": '!coach'
                            };

                            SocialInteractionService
                                .getSocialInteractions(params)
                                .then(ActivityService.populateIdeas)
                                .then(function (socialInteractions) {

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
                        var options = scope.options = {};
                        options.isCampaignLead = attrs.soiAdministration;

                        scope.componentClass = function (socialInteraction) {
                            if (!socialInteraction) {
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

                            if (socialInteraction.idea) {
                                return $state.go('dhc.activity', {
                                    campaignId: $stateParams.campaignId,
                                    idea: socialInteraction.idea ? socialInteraction.idea.id : undefined,
                                    activity: socialInteraction.activity ? socialInteraction.activity.id : undefined,
                                    socialInteraction: socialInteraction.id,
                                    mode: options.isCampaignLead ? 'campaignlead' : undefined
                                });
                            } else if (socialInteraction.__t === 'Message'){

                                // check whether this is a comment to a planned activity
                                if (socialInteraction.targetSpaces.length >= 1) {
                                    var space = _.find(socialInteraction.targetSpaces, function(space) {
                                            return space.type === 'activity';
                                        });

                                    if (space) {
                                        var actId = space.targetId;
                                        return $state.go('^.activity', {
                                            campaignId: $stateParams.campaignId,
                                            activity: actId
                                        });
                                    }

                                }
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
                        editedMessage: '=',
                        minPublishFrom: '=',
                        maxPublishTo: '='
                    },
                    templateUrl: 'components/social-interaction/social-interaction-message-compose-directive.html',

                    link: function (scope, elem, attrs) {

                        var publishFrom = moment().isAfter(scope.minPublishFrom) ?
                            new Date(moment().startOf('day')).toDate() :
                            moment(scope.minPublishFrom).toDate();
                        var publishTo = moment(publishFrom).add(2, 'days').toDate();

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

                            publishFrom: publishFrom,
                            publishTo: publishTo
                        };

                        scope.hasCampaign = $stateParams.campaignId;

                        scope.$watch('editedMessage', function (newVal, oldVal) {
                            if (newVal) {
                                scope.message = newVal;
                            }
                        });

                        scope.$watch('message.publishFrom', function (newVal, oldVal) {
                            if (newVal && newVal !== oldVal) {
                                var newPublishTo =  moment(newVal).add(2, 'days');
                                if (newPublishTo.isAfter(scope.maxPublishTo)) {
                                    newPublishTo = moment(scope.maxPublishTo);
                                }

                                scope.message.publishTo = newPublishTo.toDate();
                            }
                        });


                        if (!scope.message) {
                            scope.message = _.clone(messageTemplate);
                        }

                        scope.cancel = function (message) {
                            delete message._editMode;
                            scope.message = _.clone(messageTemplate);
                            scope.editedMessage = null;
                        };

                        scope.saveMessage = function saveMessage(message) {

                            // if publishFrom is today, use current time instead of the start of the day
                            // publishTo is always the end of the day set in the messageTemplate
                            if(moment(message.publishFrom).isSame(moment(), 'day')) {
                                message.publishFrom = new Date(moment());
                            } else {
                                message.publishFrom = new Date(moment(message.publishFrom).startOf('day'));
                            }

                            if (message.id) {
                                SocialInteractionService.putSocialInteraction(message).then(function (saved) {
                                    saved.author = $rootScope.principal.getUser();
                                    delete message._editMode;
                                    _.merge(message, saved);
                                    scope.message = _.clone(messageTemplate);
                                    scope.composeMessageForm.$setPristine();
                                    scope.editedMessage = null;
                                });

                            } else {
                                SocialInteractionService.postMessage(message).then(function (saved) {
                                    saved.author = $rootScope.principal.getUser();
                                    if (scope.onPost && _.isFunction(scope.onPost)) {
                                        scope.onPost({message: saved});
                                    }
                                    scope.message = _.clone(messageTemplate);
                                    scope.composeMessageForm.$setPristine();
                                });
                            }
                        };
                    }
                };
            }]);
}());