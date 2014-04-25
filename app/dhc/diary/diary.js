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
                        access: accessLevels.user
                    })
                    .state('diary.content', {
                        url: "/diary",
                        access: accessLevels.user,
                        views: {
                            content: {
                                templateUrl: 'dhc/diary/diary.html',
                                controller: 'DiaryController'
                            }
                        },
                        resolve: {
                            diaryEntries: ['DiaryService', function (DiaryService) {
                                return DiaryService.getEntries({populate: 'activityPlan'});
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/diary/diary');
            }])

        .controller('DiaryController', [ '$scope', '$rootScope', 'diaryEntries', '$modal', 'DiaryService', 'ProfileService',
            function ($scope, $rootScope, diaryEntries, $modal, DiaryService, ProfileService) {


                function _getEntryGroups(entries) {
                    var groupedEntries = _.groupBy(
                        _.sortBy(entries, function (entry) {
                            return entry.dateBegin;
                        }).reverse(), function (entry) {

                            var date = entry.dateBegin;

                            var diff = Math.abs(moment().hour(0).minute(0).second(0).millisecond(0).diff(date, 'days', true));

                            if ((diff > 1)) {
                                return 'future';
                            } else if (diff > 0) {
                                return 'today';
                            } else if (diff > -1) {
                                return 'yesterday';
                            } else if (diff > -7) {
                                return 'week';
                            } else if (diff > -31) {
                                return 'month';
                            } else {
                                return 'other';
                            }

                        });

                    var groupsNames = [
                        'today',
                        'future',
                        'yesterday',
                        'week',
                        'month',
                        'other'
                    ];

                    var groups = [];

                    _.forEach(groupsNames, function (group) {
                        if (groupedEntries[group]) {
                            groups.push({
                                name: group,
                                entries: groupedEntries[group]
                            });
                        }
                    });
                    return groups;
                }


                $scope.groups = _getEntryGroups(diaryEntries);


                $scope.showModal = function () {
                    DiaryService.showDiaryModal().then(function (newEntry) {
                        if (newEntry) {
                            diaryEntries.push(newEntry);
                            $scope.groups = _getEntryGroups(diaryEntries);
                        }
                    });
                };

            }
        ])

        .controller('DiaryModalController', ['$scope', '$modalInstance', 'topic', 'resolution',
            function ($scope, $modalInstance, topic, resolution) {
                $scope.topic = topic;
                $scope.resolution = resolution;

                $scope.result = {
                    entry: {
                        feedback: null,
                        text: null,
                        type: 'manual',
                        dateBegin: new Date()
                    },
                    doNotAskAgainToday: false
                };

                $scope.ok = function () {
                    $modalInstance.close($scope.result);
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }]);

}());