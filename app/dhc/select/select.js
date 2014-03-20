(function () {
    'use strict';

    angular.module('yp.dhc.select',
        [
            'restangular',
            'ui.router'
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

        .controller('SelectController', [ '$scope', '$rootScope',
            function ($scope, $rootScope) {

                var dummy = {
                    image: 'https://googledrive.com/host/0B95w28y1cwlsMDdMUFQ1TmFpWG8/5278c6adcdeab69a25000047.jpg',

                    source: {
                        avatar: 'assets/img/campaign_leader_avatar_1.png',
                        text: 'Kampagnenempfehlung'
                    },

                    activity: {
                        title: 'Zusammen Laufen',
                        shortDescription: 'Gehe einmal pro Woche während der Mittagspause mit Arbeitskollegen oder Freunden joggen'
                    },

                    schedule: "Einmal pro Woche"
                };

                $scope.recommendations = [
                    _.extend(_.clone(dummy), { id: _.random()}),
                    _.extend(_.clone(dummy), { id: _.random()}),
                    _.extend(_.clone(dummy), { id: _.random()})
                ];

            }
        ]);

}());