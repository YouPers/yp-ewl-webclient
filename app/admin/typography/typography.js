(function () {
    'use strict';

    angular.module('yp.admin',
        [
            'restangular',
            'ui.router'
        ])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('typography', {
                        templateUrl: "layout/admin-default.html",
                        access: accessLevels.all
                    })
                    .state('typography.content', {
                        url: "/admin/typography",
                        access: accessLevels.admin,
                        views: {
                            content: {
                                templateUrl: 'admin/typography/typography.html'
                            }
                        },
                        resolve: {

                        }
                    });

            }]);
}());