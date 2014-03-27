(function () {
    'use strict';

    angular.module('yp.dhc.schedule',
        [
            'restangular',
            'ui.router'
        ])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('schedule', {
                        templateUrl: "layout/default.html",
                        access: accessLevels.all
                    })
                    .state('schedule.content', {
                        url: "/schedule",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dhc/schedule/schedule.html',
                                controller: 'ScheduleController'
                            }
                        },
                        resolve: {

                        }
                    });

//                $translateWtiPartialLoaderProvider.addPart('yp.dhc.select');
            }])

        .controller('ScheduleController', [ '$scope', '$rootScope', '$stateParams', 'ActivityService',
            function ($scope, $rootScope, $stateParams, ActivityService) {

                ActivityService.getActivityOffers().then(function(offers) {
                    $scope.rec = offers[_.random(0, offers.length)];
                });


            }
        ]);

}());