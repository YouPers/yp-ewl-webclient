(function () {

    'use strict';

    angular.module('yp.components.activityComments', [])
        .directive('activityComments', ['$rootScope', '$state', '$stateParams', 'accessLevels', 'UserService', 'SocialInteractionService',
            function ($rootScope, $state, $stateParams, accessLevels, UserService, SocialInteractionService) {
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

                        var user = scope.user = UserService.principal.getUser();

                        scope.keypress = function keypress($event) {
                            if($event.keyCode === 13 && !$event.shiftKey) {
                                scope.saveMessage();
                            }
                        };

                        scope.saveMessage = function saveMessage() {
                            SocialInteractionService.postMessage(scope.message).then(function() {
//                                scope.messages.unshift(scope.message);
                                activate();
                            });
                        };

                        scope.dismissSocialInteraction = function dismissSocialInteraction(message) {
                            SocialInteractionService.deleteSocialInteraction(message.id);
                            _.remove(scope.messages, { id: message.id });
                        };

                        function activate() {

                            var template = {
                                author: user,
                                authorType: 'user',

                                targetSpaces: [
                                    {
                                        type: 'activity',
                                        targetId: scope.activity && scope.activity.id
                                    }
                                ]
                            };
                            scope.message = _.clone(template);

                            SocialInteractionService.getMessages({
                                populate: 'author',
                                targetId: scope.activity && scope.activity.id
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