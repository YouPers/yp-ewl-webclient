(function () {

    'use strict';

    angular.module('yp.components.activityComments', [])
        .directive('activityComments', ['$rootScope', '$state', '$stateParams', 'accessLevels', 'UserService', 'SocialInteractionService', 'ActivityService',
            function ($rootScope, $state, $stateParams, accessLevels, UserService, SocialInteractionService, ActivityService) {
                return {
                    restrict: 'E',
                    scope: {
                        activity: '='
                    },
                    templateUrl: 'components/directives/activity-comments-directive/activity-comments-directive.html',

                    link: function (scope, elem, attrs) {

                        if(!scope.activity) {
                            throw new Error('attribute "activity" is required');
                        }

                        if(!scope.activity.id) {
                            throw new Error('activity.id is undefined');
                        }

                        var user = scope.user = UserService.principal.getUser();

                        scope.keypress = function keypress($event) {
                            if($event.keyCode === 13 && !$event.shiftKey) {
                                scope.saveMessage();
                            }
                        };

                        scope.saveMessage = function saveMessage() {
                            SocialInteractionService.postMessage(scope.message).then(function() {
                                scope.messages.unshift(scope.message);
                                reset();
                            });
                        };

                        scope.dismissSocialInteraction = function dismissSocialInteraction(message) {
                            SocialInteractionService.deleteSocialInteraction(message.id);
                            _.remove(scope.messages, { id: message.id });
                        };

                        scope.onCommentAreaBlur = function onCommentAreaBlur() {
                            if (scope.message && scope.message.text && scope.message.text.length > 0) {
                                // dont hide the button, if we have a message
                            } else {
                                scope.showPostButton = false;
                            }
                        };

                        function reset() {

                            var template = {
                                author: user,
                                authorType: 'user',
                                publishFrom: new Date(),
                                activity: scope.activity.id,

                                targetSpaces: [
                                    {
                                        type: 'activity',
                                        targetId: scope.activity && scope.activity.id
                                    }
                                ]
                            };
                            scope.message = _.clone(template);
                            //scope.showPostButton = false; // always show post button once activated, see WL-2100

                            ActivityService.updateActivityLookahead(scope.activity);
                        }

                        function activate() {

                            reset();

                            SocialInteractionService.getMessages({
                                populate: 'author',
                                authored: true,
                                dismissed: true,
                                targetId: scope.activity.id
                            }).then(function (messages) {
                                scope.messages = _.sortBy(messages, function(message) {
                                    return - new Date(message.created).getTime();
                                });
                            });
                        }

                        activate();
                    }
                };
            }]);

}());