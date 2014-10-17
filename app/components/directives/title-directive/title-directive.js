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
                    scope: {
                        interpolation: '='
                    },
                    templateUrl: 'components/directives/title-directive/title-directive.html',

                    link: function (scope, elem, attrs) {

                        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {


                            $state.$current.locals.resolve.then(function (values) {

                                $translate('pageTitle.default', values).then(function (translation) {
                                    scope.pageTitle = translation;
                                });

                                var key = 'pageTitle.' + toState.name;
                                console.log('pageTitle key: ' + key)
                                $translate(key, values).then(function (translation) {
                                    scope.pageTitle = translation;
                                });
                            });


                        });
                    }
                };
            }]);

}());