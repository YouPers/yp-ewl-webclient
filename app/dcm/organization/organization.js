(function () {
    'use strict';

    angular.module('yp.dcm.organization',
        [
            'restangular',
            'ui.router'
        ])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('organization', {
                        templateUrl: "layout/default.html",
                        access: accessLevels.all
                    })
                    .state('organization.content', {
                        url: "/organization",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dcm/organization/organization.html'
                            }
                        },
                        resolve: {

                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/organization/organization');
            }]);

}());