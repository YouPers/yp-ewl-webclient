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
                    .state('admin.typography', {
                        url: "/typography",
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