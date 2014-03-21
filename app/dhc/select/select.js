(function () {
    'use strict';

    angular.module('yp.dhc.select',
        [
            'restangular',
            'ui.router',
            'ngAnimate'
        ])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('select', {
                        templateUrl: "layout/default.html",
                        access: accessLevels.all
                    })
                    .state('select.content', {
                        url: "/select",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dhc/select/select.html',
                                controller: 'SelectController'
                            }
                        },
                        resolve: {

                        }
                    });

//                $translateWtiPartialLoaderProvider.addPart('yp.dhc.select');
            }])

        .controller('SelectController', [ '$scope', '$rootScope', 'ActivityService',
            function ($scope, $rootScope, ActivityService) {

//                var dummy = {
//                    image: 'https://googledrive.com/host/0B95w28y1cwlsMDdMUFQ1TmFpWG8/5278c6adcdeab69a25000047.jpg',
//
//                    source: {
//                        avatar: 'assets/img/campaign_leader_avatar_1.png',
//                        text: 'Kampagnenempfehlung'
//                    },
//
//                    activity: {
//                        title: 'Zusammen Laufen',
//                        shortDescription: 'Gehe einmal pro Woche während der Mittagspause mit Arbeitskollegen oder Freunden joggen',
//                        longDescription: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.'
//                    },
//
//                    schedule: "Einmal pro Woche"
//                };

                ActivityService.getActivityOffers().then(function(offers) {
                    $scope.recommendations = offers;
                });

                $scope.reject = function(index, event) {
                    event.stopPropagation();
                    $scope.recommendations.splice(index, 1);
                };


            }
        ]);

}());