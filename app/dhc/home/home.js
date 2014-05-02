(function () {
    'use strict';

    angular.module('yp.dhc.home',
        [
            'restangular',
            'ui.router'
        ])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('home', {
                        templateUrl: "layout/default.html",
                        access: accessLevels.all
                    })
                    .state('home.content', {
                        url: "/home",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dhc/home/home.html'
                            }
                        },
                        resolve: {

                        }
                    })
                    .state('moreinfo', {
                        templateUrl: "layout/single-column.html",
                        access: accessLevels.all
                    })
                    .state('moreinfo.content', {
                        url: "/moreinfo",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dhc/home/moreinfo.html'
                            }
                        },
                        resolve: {

                        }
                    });


                $translateWtiPartialLoaderProvider.addPart('dhc/home/home');
            }]);

}());