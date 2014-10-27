(function () {

    'use strict';

    angular.module('yp.components.activityLookahead', [])
        .directive('activityLookahead', ['localStorageService', 'ActivityService',
            function (localStorageService, ActivityService) {
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

                        var lastAccess = localStorageService.get('lastAccess') || {};
                        var lastActivityAccess = lastAccess[scope.activity.id];

                        ActivityService.getActivityLookaheadCounters(scope.activity.id, lastActivityAccess).then(function (result) {
                            _.extend(scope, result);
                        });
                    }
                };
            }]);

}());