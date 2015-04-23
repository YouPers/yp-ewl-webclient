(function () {
    'use strict';


    angular.module('yp.admin',
        [
            'yp.components.user',
            'ngSanitize',
        ])


        .config(['$stateProvider', 'accessLevels', function ($stateProvider, accessLevels) {

            $stateProvider
                .state('admin', {

                    abstract: true,

                    url: "/admin",
                    templateUrl: "layout/default.html",
                    controller: 'AdminController as adminController',

                    access: accessLevels.all,

                    resolve: {}
                });

        }])

        .controller('AdminController', ['$scope',
            function ($scope) {

            }]);

}());