(function () {

    'use strict';

    angular.module('yp.components.activity')
        .directive('activityView', ['UserService', 'SocialInteractionService',
            function (UserService, SocialInteractionService) {
                return {
                    restrict: 'E',
                    scope: {
                        activity: '=',
                        isCampaignLead: '=',
                        socialInteraction: '='
                    },
                    templateUrl: 'components/activity/activity-view-directive.html',

                    link: function (scope, elem, attrs) {

                        scope.invitedUsers = [];

                        scope.onUserSelected = function onUserSelected(user) {
                            scope.invitedUsers.push(user);

                            var invitation = {
                                targetSpaces: [{
                                    type: 'user',
                                    targetId: user.id
                                }],
                                author: UserService.principal.getUser().id,
                                activity: scope.activity.id,
                                idea: scope.activity.idea.id || scope.activity.idea
                            };

                            SocialInteractionService.postInvitation(invitation);
                        };

                    }
                };
            }]);

}());