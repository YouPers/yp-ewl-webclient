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

                    var index = 0;
                    scope.currentUser = users ? [users[index]] : [];

                    if(users.length > 1) {
                        $interval(function () {
                            index = (index + 1) % users.length;
                            scope.currentUser = [users[index]];
                        }, 1000);
                    }

                }
            };
        }]);

}());