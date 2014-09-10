(function () {

    'use strict';

    angular.module('yp.components.activity')
        .directive('activityList', [
            function () {
                return {
                    restrict: 'E',
                    scope: {
                        activities: '=',
                        activity: '=',
                        onSelect: '='
                    },
                    templateUrl: 'components/activity/activity-list-directive.html',

                    link: function (scope, elem, attrs) {


                        scope.stati = ['invited', 'owned', 'joined'];

                        scope.statusCounts = {
                            all: scope.activities.length
                        };
                        scope.statusCounts = _.countBy(scope.activities, 'status');
                        _.forEach(scope.stati, function(status) {

                        });

                        scope.statusClasses = {
                            owned: 'fa-user',
                            joined: 'fa-users',
                            invited: 'fa-envelope-o'
                        };

                    }
                };
            }]);

}());