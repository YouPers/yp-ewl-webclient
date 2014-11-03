(function () {

    'use strict';

    angular.module('yp.components.activityLookahead', [])

        .config(['$translateWtiPartialLoaderProvider', function($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('components/directives/activity-lookahead-directive/activity-lookahead-directive');
        }])

        .directive('activityLookahead', ['localStorageService', 'ActivityService', 'UserService',
            function (localStorageService, ActivityService, UserService) {
                return {
                    restrict: 'E',
                    scope: {
                        activity: '='
                    },
                    templateUrl: 'components/directives/activity-lookahead-directive/activity-lookahead-directive.html',

                    link: function (scope, elem, attrs) {

                        if(!scope.activity) {
                            throw new Error('attribute "activity" is required');
                        }

                        if(!scope.activity.id) {
                            throw new Error('activity.id is undefined');
                        }

                        if(scope.activity.executionType !== 'group') {
                            throw new Error('activity-lookahead is only supported for group activities');
                        }

                        var user = UserService.principal.getUser();

                        // use combined key so we don't need to initialize and maintain a nested configuration object

                        var localStorage = localStorageService.get('user=' + user.id) || {};
                        var lastActivityAccess = localStorage[scope.activity.id];

                        ActivityService.getActivityLookaheadCounters(scope.activity.id, lastActivityAccess).then(function (result) {
                            _.extend(scope, result);
                        });
                    }
                };
            }]);

}());