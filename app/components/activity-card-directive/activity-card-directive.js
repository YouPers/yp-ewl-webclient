(function () {

    'use strict';

    angular.module('yp.dhc')
        .directive('activityCard', ['UserService', function (UserService) {
            return {
                restrict: 'EA',
                scope: {
                    rec: '=rec'
                },
                templateUrl: 'components/activity-card-directive/activity-card-directive.html',

                link: function (scope, elem, attrs) {



                }
            };
        }]);

}());