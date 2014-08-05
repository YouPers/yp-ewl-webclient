(function () {
    'use strict';

    angular.module('yp.dhc')

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
                                return DiaryService.getEntries({populate: 'activity'});
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/diary/diary');
            }])

        .controller('DiaryController', [ '$scope', '$rootScope', 'diaryEntries', '$modal', 'DiaryService', 'ProfileService',
            function ($scope, $rootScope, diaryEntries, $modal, DiaryService, ProfileService) {


                function _getEntryGroups(entries) {


                    var groupNames = [

                        'future',
                        'today',
                        'yesterday',
                        'week'
                    ];

                    var groupedEntries = _.groupBy(
                        _.sortBy(entries, function (entry) {
                            return entry.dateBegin;
                        }).reverse(), function (entry) {

                            var date = entry.dateBegin;


                            var today = moment().hour(0).minute(0).second(0).millisecond(0);
                            var yesterday = moment(today).subtract(1, 'days');

                            var lastWeek = moment(today).day(1);
//                            var lastMonth = moment(today).date(1).month((today.month() - 1));
                            var lastYear = moment(today).month(0).date(1).subtract(1, 'years');


                            var eventDate = moment(date);

                            if(eventDate.diff(moment()) > 0) {
                                return 'future';
                            }
                            else if(eventDate.diff(today) > 0) {
                                return 'today';
                            } else if(eventDate.diff(yesterday) > 0) {
                                return 'yesterday';
                            } else if(eventDate.diff(lastWeek) > 0) {
                                return 'week';
                            } else if(eventDate.diff(lastYear) > 0) {
                                var month = eventDate.month();
                                if(!_.contains(groupNames, month)) {
                                    groupNames.push(month);
                                }
                                return  month;
                            } else {
                                return 'year';
                            }

                        });

                    groupNames.push('year');

                    var groups = [];

                    _.forEach(groupNames, function (group) {
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
                    DiaryService.showDiaryModal($scope.principal.getUser().profile.prefs.personalGoal, 'manual').then(function (newEntry) {
                        if (newEntry) {
                            diaryEntries.push(newEntry);
                            $scope.groups = _getEntryGroups(diaryEntries);
                        }
                    });
                };

            }
        ])

        .controller('DiaryModalController', ['$scope', '$modalInstance', 'topic', 'resolution', 'mode',
            function ($scope, $modalInstance, topic, resolution, mode) {
                $scope.topic = topic;
                $scope.resolution = resolution;
                $scope.mode = mode;

                var profile = $scope.principal.getUser().profile;
                var doNotAskAgainForDiaryEntry = profile.prefs.doNotAskAgainForDiaryEntry;

                $scope.result = {
                    entry: {
                        feedback: null,
                        text: null,
                        type: 'manual',
                        dateBegin: new Date()
                    },
                    doNotAskAgainForDiaryEntry: doNotAskAgainForDiaryEntry
                };

                $scope.ok = function () {
                    $modalInstance.close($scope.result);
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }]);

}());