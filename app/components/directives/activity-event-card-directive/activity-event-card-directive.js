(function () {

    'use strict';


    /**
     * activityEventStack
     *
     *  required scope attributes:
     *
     *      - type: one of
     *
     *          - current: currently active events of a single activity (default)
     *          - past: list of done or missed events that have already past
     *
     *          - invitation: activity from an invitation, displays the author, mocks the number of events with the mainEvent
     *          - recommendation: activity from a recommendation, displays the author
     *
     *          - dismissed: list of invitations and recommendation the user has dismissed
     *
     *      - events: an event can be populated with an idea, and optionally, the activity ( needed for the location )
     *                  to show events with arbitrary ideas/activities
     *      - idea: default idea if no individual idea is attached to an event            
     *      - activity: default activity if no individual activity is attached to an event            
     *
     */
    angular.module('yp.components.activityEventCard', [])

        .config(['$translateWtiPartialLoaderProvider', function($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('components/directives/activity-event-card-directive/activity-event-card-directive');
        }])

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