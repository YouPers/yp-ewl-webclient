(function () {

    'use strict';

    angular.module('yp.components.recommendedBySlider', [])
        .directive('recommendedBySlider', ['$interval', function ($interval) {
            return {
                restrict: 'EA',
                scope: {
                    users: '=',
                    sourceType: '='
                },
                templateUrl: 'components/directives/recommended-by-slider-directive/recommended-by-slider-directive.html',

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