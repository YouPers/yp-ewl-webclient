'use strict';

angular.module('yp.ewl.evaluate', ['restangular', 'ui.router', 'yp.auth'])

    .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
        function ($stateProvider, $urlRouterProvider, accessLevels) {
            $stateProvider
                .state('evaluate', {
                    url: "/evaluate",
                    templateUrl: "partials/evaluate.html",
                    controller: "EvaluateCtrl",
                    access: accessLevels.all,
                    resolve: {

                    }
                });
        }])
    .controller('EvaluateCtrl', ['$scope', '$filter', 'yp.user.UserService',
        function ($scope, $filter, UserService) {

        }]);