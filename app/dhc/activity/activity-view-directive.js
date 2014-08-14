(function () {

    'use strict';

    angular.module('yp.dhc')
        .directive('activityView', ['$rootScope', '$state','accessLevels', 'UserService', 'SocialInteractionService',
            function ($rootScope, $state, accessLevels, UserService, SocialInteractionService) {
                return {
                    restrict: 'E',
                    scope: {
                        activity: '='
                    },
                    templateUrl: 'dhc/activity/activity-view-directive.html',

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
                                refDocs: [{
                                    docId: scope.activity.id,
                                    model: 'Activity'
                                }]
                            };

                            SocialInteractionService.postInvitation(invitation);
                        };

                    }
                };
            }]);

}());