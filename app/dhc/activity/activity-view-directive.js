(function () {

    'use strict';

    angular.module('yp.dhc')
        .directive('activityView', ['$rootScope', '$state','accessLevels', 'SocialInteractionService',
            function ($rootScope, $state, accessLevels, SocialInteractionService) {
                return {
                    restrict: 'E',
                    scope: {
                        activity: '='
                    },
                    templateUrl: 'dhc/activity/activity-view-directive.html',

                    link: function (scope, elem, attrs) {


                    }
                };
            }]);

}());