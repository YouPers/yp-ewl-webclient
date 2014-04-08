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
                                return DiaryService.getEntries({populate: 'activityPlan'});
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/diary/diary');
            }])

        .controller('DiaryController', [ '$scope', '$rootScope', '$stateParams', '$location', '$window', '$timeout', 'diaryEntries',
            function ($scope, $rootScope, $stateParams, $location, $window, $timeout, diaryEntries) {

                var groupedEntries = _.groupBy(diaryEntries, function(entry) {

                    var date = entry.created;

                    var diff = Math.abs(moment().diff(date, 'days'));

                    // TODO: finetune today/tomorrow

                    if(diff < 1) {
                        return 'today';
                    } else if(diff < 2) {
                        return 'tomorrow';
                    } else if(diff < 7) {
                        return 'week';
                    } else if(diff < 31) {
                        return 'month';
                    } else {
                        return 'other';
                    }

                });

                var groups = [
                    'today',
                    'tomorrow',
                    'week',
                    'month',
                    'other'
                ];

                $scope.groups = [];
                _.forEach(groups, function (group) {
                    if(groupedEntries[group]) {
                        $scope.groups.push({
                            name: group,
                            entries: groupedEntries[group]
                        });
                    }
                });
            }
        ]);

}());