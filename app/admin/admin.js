(function () {
    'use strict';


    angular.module('yp.admin',
        [
            'yp.components.user',
            'ngSanitize'
        ])


        .config(['$stateProvider', 'accessLevels', '$translateWtiPartialLoaderProvider', function ($stateProvider, accessLevels, $translateWtiPartialLoaderProvider) {

            $stateProvider
                .state('admin', {

                    abstract: true,

                    url: "/admin",
                    templateUrl: "layout/admin-default.html",
                    controller: 'AdminController as adminController',

                    access: accessLevels.all,

                    resolve: {}
                });

        }])

        .controller('AdminController', ['$scope',
            function ($scope) {

            }]);

}());