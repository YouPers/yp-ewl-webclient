(function () {

    'use strict';

    angular.module('yp.dhc')
        .directive('activityCard', ['$rootScope', function ($rootScope) {
            return {
                restrict: 'EA',
                scope: {
                    rec: '=rec',
                    reject: '&',
                    plan: '&',
                    index: '=index'
                },
                templateUrl: 'components/activity-card-directive/activity-card-directive.html',

                link: function (scope, elem, attrs) {

                    scope.scheduleLink = '/#/schedule/' + scope.rec.id;

                    scope.flip = function() {
                        var flipped = scope.flipped;
                        $rootScope.$broadcast('flipped');
                        scope.flipped = !flipped;
                    };

                    $rootScope.$on('flipped', function() {
                        scope.flipped = false;
                    });


                }
            };
        }]);

}());