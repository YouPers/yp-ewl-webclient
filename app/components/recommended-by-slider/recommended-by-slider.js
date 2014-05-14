(function () {

    'use strict';

    angular.module('yp.dhc')
        .directive('recommendedBySlider', ['$interval', function ($interval) {
            return {
                restrict: 'EA',
                scope: {
                    users: '=',
                    sourceType: '='
                },
                templateUrl: 'components/recommended-by-slider/recommended-by-slider.html',

                link: function (scope, elem, attrs) {

                    var users = scope.users;
                    scope.current = 0;

                    if(users.length > 1) {
                        $interval(function () {
                            scope.current = (scope.current + 1) % users.length;
                        }, 1000);
                    }

                }
            };
        }]);

}());