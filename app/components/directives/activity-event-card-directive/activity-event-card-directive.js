(function () {

    'use strict';

    angular.module('yp.components.activityEventCard', [])

        .directive('activityEventCard', ['$rootScope', '$sce', '$window', '$state', function ($rootScope, $sce, $window, $state) {
            return {
                restrict: 'EA',
                scope: {
                    type: '@',
                    event: '='
                },
                templateUrl: 'components/directives/activity-event-card-directive/activity-event-card-directive.html',

                link: function (scope, elem, attrs) {

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