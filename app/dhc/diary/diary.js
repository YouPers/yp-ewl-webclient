(function () {
    'use strict';

    angular.module('yp.dhc.diary',
        [
            'restangular',
            'ui.router'
        ])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('diary', {
                        templateUrl: "layout/default.html",
                        access: accessLevels.all
                    })
                    .state('diary.content', {
                        url: "/diary",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dhc/diary/diary.html',
                                controller: 'DiaryController'
                            }
                        },
                        resolve: {
                            diaryEntries: ['DiaryService', function(DiaryService) {
                                return DiaryService.getEntries();
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/diary/diary');
            }])

        .controller('DiaryController', [ '$scope', '$rootScope', '$stateParams', '$location', '$window', '$timeout', 'diaryEntries',
            function ($scope, $rootScope, $stateParams, $location, $window, $timeout, diaryEntries) {
                $scope.diaryEntries = diaryEntries;

            }
        ]);

}());