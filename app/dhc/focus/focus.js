(function () {
    'use strict';

    angular.module('yp.dhc.focus',
        [
            'ui.router'
        ])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('focus', {
                        templateUrl: "layout/default.html",
                        access: accessLevels.all
                    })
                    .state('focus.content', {
                        url: "/focus",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dhc/focus/focus.html',
                                controller: 'FocusController'
                            }
                        },
                        resolve: {
                            
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/focus/focus');
            }])

        .controller('FocusController', [ '$scope',
            function ($scope) {

                $scope.categories = [
                    'work',
                    'leisure',
                    'handling',
                    'stresstypus'
                ];

            }
        ]);

}());