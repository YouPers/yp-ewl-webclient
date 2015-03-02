(function () {
    'use strict';

    angular.module('yp.admin')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('admin.home', {
                        url: "/home",
                        access: accessLevels.admin,
                        views: {
                            content: {
                                templateUrl: 'admin/home/home.html',
                                controller: 'AdminHomeController'
                            }
                        },
                        resolve: {

                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('admin/home/home');
            }])

        .controller('AdminHomeController', ['$scope', '$rootScope', 'UserService',
            function($scope, $rootScope, UserService) {

        }]);
}());