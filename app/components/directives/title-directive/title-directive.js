(function () {

    'use strict';

    angular.module('yp.components.title', [])

        .config(['$translateWtiPartialLoaderProvider', function($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('components/directives/title-directive/title-directive');
        }])

        .directive('title', ['$rootScope', '$state', '$translate',
            function ($rootScope, $state, $translate) {
                return {
                    restrict: 'E',
                    scope: { },

                    link: function (scope, elem, attrs) {

                        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {

                            $state.$current.locals.resolve.then(function (values) {

                                // default
                                $translate('pageTitle.default', values).then(function (translation) {
                                    elem.text(translation);
                                });

                                // translation for current state, promise does not resolve when no translation is found -> default
                                var key = 'pageTitle.' + toState.name;

                                $translate(key, values).then(function (translation) {
                                    elem.text(translation);
                                });
                            });

                        });
                    }
                };
            }]);

}());