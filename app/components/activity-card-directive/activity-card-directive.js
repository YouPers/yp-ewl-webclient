(function () {

    'use strict';

    angular.module('yp.components')
        .directive('activityCard', ['$rootScope', '$sce', function ($rootScope, $sce) {
            return {
                restrict: 'EA',
                scope: {
                    rec: '=rec',
                    reject: '&',
                    schedule: '&',
                    index: '=index'
                },
                templateUrl: 'components/activity-card-directive/activity-card-directive.html',

                link: function (scope, elem, attrs) {

                    scope.flip = function() {
                        var flipped = scope.flipped;
                        $rootScope.$broadcast('flipped');
                        scope.flipped = !flipped;
                    };

                    $rootScope.$on('flipped', function() {
                        scope.flipped = false;
                    });


                    scope.getRenderedText = function (text) {
                        if (text) {
                            return $sce.trustAsHtml(marked(text));
                        } else {
                            return "";
                        }
                    };
                }
            };
        }]);

}());