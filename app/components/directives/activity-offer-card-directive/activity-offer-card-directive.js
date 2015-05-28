(function () {

    'use strict';

    angular.module('yp.components.activityOfferCard', [])

        .config(['$translateWtiPartialLoaderProvider', function($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('components/directives/activity-offer-card-directive/activity-offer-card-directive');
        }])

        .directive('activityOfferCard', ['$rootScope', '$sce', '$state', function ($rootScope, $sce, $state) {
            return {
                restrict: 'EA',
                scope: {
                    socialInteraction: '=',
                    activity: '=',
                    idea: '=',
                    onDismiss: '&' // dismiss link is only available if this scope attribute is defined as well
                },
                templateUrl: 'components/directives/activity-offer-card-directive/activity-offer-card-directive.html',

                link: function (scope, elem, attrs) {

                    var authorType = scope.socialInteraction.authorType;
                    scope.componentClass = 'offer' + authorType.charAt(0).toUpperCase() + authorType.slice(1);
                    scope.hasDismiss = !!attrs.onDismiss;

                    scope.iconClass = scope.socialInteraction.__t === 'Recommendation' ? 'fa-lightbulb-o' : 'fa-envelope-o';
                    scope.isDcm = $state.current.name.indexOf('dcm') === 0;
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