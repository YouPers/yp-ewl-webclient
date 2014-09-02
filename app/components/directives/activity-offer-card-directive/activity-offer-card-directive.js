(function () {

    'use strict';

    angular.module('yp.components.activityOfferCard', [])

        .config(['$translateWtiPartialLoaderProvider', function($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('components/directives/activity-offer-card-directive/activity-offer-card-directive');
        }])

        .directive('activityOfferCard', ['$rootScope', '$sce', '$window', '$state', function ($rootScope, $sce, $window, $state) {
            return {
                restrict: 'EA',
                scope: {
                    socialInteraction: '=',
                    activity: '=',
                    idea: '='
                },
                templateUrl: 'components/directives/activity-offer-card-directive/activity-offer-card-directive.html',

                link: function (scope, elem, attrs) {

                    var authorType = scope.socialInteraction.authorType;
                    scope.componentClass = 'offer' + authorType.charAt(0).toUpperCase() + authorType.slice(1);

                    scope.iconClass = scope.socialInteraction.__t === 'Recommendation' ? 'fa-lightbulb-o' : 'fa-envelope-o';

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