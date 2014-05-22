(function () {

    'use strict';

    angular.module('yp.components')
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


                    function next() {
                        scope.current = (scope.current + 1) % users.length;
                    }

                    if(users && users.length > 1) {

                        next();

                        $interval(function () {
                            next();
                        }, 4000);
                    }

                }
            };
        }]);

}());