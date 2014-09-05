(function () {

    'use strict';

    angular.module('yp.components.emailInvitation', [])

        .config(['$translateWtiPartialLoaderProvider', function($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('components/directives/email-invitation-directive/email-invitation-directive');
        }])

        .directive('emailInvitation', ['ActivityService', function (ActivityService) {
            return {
                restrict: 'EA',
                scope: {
                    type: '@',
                    activity: '=',
                    onEmailSubmitted: '='
                },
                templateUrl: 'components/directives/email-invitation-directive/email-invitation-directive.html',

                link: function (scope, elem, attrs) {

                    if(!scope.type) {
                        throw new Error('emailInvitation: attribute "type" is required');
                    } else {
                        if(scope.type === 'activity' && !scope.activity) {
                            throw new Error('emailInvitation: attribute "activity" is required');
                        }
                    }

                    scope.inviteEmails = function(emailAddresses, activity) {

                        if(scope.type === 'activity') {
                            ActivityService.inviteEmailToJoinPlan(emailAddresses, activity);
                            scope.invitationSent = true;
                            scope.onEmailSubmitted(emailAddresses);
                        } else {
                            throw new Error('emailInvitation: unknown type: ' + scope.type);
                        }

                    };

                }
            };
        }]);

}());