(function () {

    'use strict';

    angular.module('yp.dhc')
        .directive('activityEdit', ['$rootScope', '$state','accessLevels',
            function ($rootScope, $state, accessLevels) {
                return {
                    restrict: 'E',
                    scope: {
                        activity: '='
                    },
                    templateUrl: 'dhc/activity/activity-edit-directive.html',

                    link: function (scope, elem, attrs) {



                    }
                };
            }]);

}());