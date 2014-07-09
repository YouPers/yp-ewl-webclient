(function () {

    'use strict';

    angular.module('yp.dhc')
        .directive('activityList', ['$rootScope', '$state','accessLevels', 'SocialInteractionService',
            function ($rootScope, $state, accessLevels) {
                return {
                    restrict: 'E',
                    scope: {
                        activities: '=',
                        activity: '=',
                        onSelect: '='
                    },
                    templateUrl: 'dhc/activity/activity-list-directive.html',

                    link: function (scope, elem, attrs) {


                        scope.stati = ['invited', 'owned', 'joined'];

                        scope.statusClasses = {
                            owned: 'fa-user',
                            joined: 'fa-users',
                            invited: 'fa-envelope-o'
                        };

                    }
                };
            }]);

}());