(function () {

    'use strict';

    angular.module('yp.components.title', [])

        .config(['$translateWtiPartialLoaderProvider', function($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('components/directives/title-directive/title-directive');
        }])

        .directive('title', ['$rootScope', '$state', '$stateParams', 'accessLevels', 'UserService', 'SocialInteractionService',
            function ($rootScope, $state, $stateParams, accessLevels, UserService, SocialInteractionService) {
                return {
                    restrict: 'E',
                    scope: {
                        interpolation: '='
                    },
                    templateUrl: 'components/directives/title-directive/title-directive.html',

                    link: function (scope, elem, attrs) {

                        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {

                            scope.translationKey = 'pageTitle.' + toState.name;
                            $state.$current.locals.resolve.then(function (values) {
                                scope.interpolationParams = values;
                            });
                        });
                    }
                };
            }]);

}());