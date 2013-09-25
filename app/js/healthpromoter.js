'use strict';

angular.module('yp.healthpromoter', ['restangular', 'ui.router', 'authentication'])

    .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
        function ($stateProvider, $urlRouterProvider, accessLevels) {
            $stateProvider
                .state('healthpromoter', {
                    url: "/healthpromoter",
                    templateUrl: "partials/healthpromoter.html",
                    controller: "HealthPromoterCtrl",
                    access: accessLevels.user
                });
        }])


    .factory('yp.healthpromoter.HealthPromoterService', ['$http', 'Restangular', function ($http, Restangular) {


        var myService = {


        };

        return myService;
    }])

    .controller('ActivityCtrl', ['$scope', 'yp.healthpromoter.HealthPromoterService', '$timeout', '$state', '$stateParams',
        function ($scope, HealthPromoterService, $timeout, $state, $stateParams) {



        }])

;

