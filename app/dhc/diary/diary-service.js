(function () {
    'use strict';

    angular.module('yp.dhc')


        .factory('DiaryService', ['$http', 'Restangular', '$q', 'UserService', '$rootScope', 'ProfileService', '$modal',
            function ($http, Restangular, $q, UserService, $rootScope, ProfileService, $modal) {

                var diaryService = {
                    getEntries: function (params) {
                        return Restangular.all('diaryentries').getList(params);
                    },
                    saveEntry: function (entry) {
                        return Restangular.all('diaryentries').post(entry);
                    },
                    showDiaryModal: function(resolution, mode) {

                        var modalInstance = $modal.open({
                            templateUrl: 'dhc/diary/diary-modal.html',
                            controller: 'DiaryModalController',
                            resolve: {
                                topic: function () {
                                    return "topic.stress";
                                },
                                resolution: function () {
                                    return resolution;
                                },
                                mode: function() {
                                    return mode;
                                }
                            },
                            windowClass: 'diary-modal'
                        });

                        return modalInstance.result.then(function (result) {
                            if (result.entry.feedback || result.entry.text) {
                                return diaryService.saveEntry(result.entry).then(function(postedEntry) {
                                        var profile = UserService.principal.getUser().profile;
                                        profile.userPreferences.lastDiaryEntry = postedEntry.created;
                                        ProfileService.putProfile(profile);
                                        return postedEntry;
                                    }
                                );
                            } else if (result.doNotAskAgainForDiaryEntry) {
                                var profile = UserService.principal.getUser().profile;
                                profile.userPreferences.lastDiaryEntry = moment();
                                profile.userPreferences.doNotAskAgainForDiaryEntry = true;
                                ProfileService.putProfile(profile);
                                return null;
                            }
                        }, function () {
                            // do nothing on dialog dismiss()
                        });
                    }
                };

                return diaryService;
            }])

        .run(['$modal', 'UserService', 'ProfileService','$rootScope', 'DiaryService',
            function ($modal, UserService, ProfileService, $rootScope, DiaryService) {

            $rootScope.$on('event:authority-authorized', function () {
                var user = UserService.principal.getUser();
                var profile = UserService.principal.getUser().profile;

                var today = moment().hour(0).minute(0).second(0).millisecond(0);
                var age = user.created ? Math.abs(today.diff(user.created, 'days', true))
                    : 0;
                var doNotAskAgain = profile.userPreferences.doNotAskAgainForDiaryEntry;

                var noDiaryEntryToday = ((!profile.userPreferences.lastDiaryEntry) || moment(profile.userPreferences.lastDiaryEntry).startOf('day').diff(moment(), 'days') < -1);

                if (age > 1 && !doNotAskAgain && noDiaryEntryToday) {
                    DiaryService.showDiaryModal(profile.userPreferences.personalGoal, 'auto');
                } else {
                    console.log("not showing Diary Modal (reason: userAge: " + (age<1)  + "; doNotAskAgain:  " + doNotAskAgain + "; diaryEntryToday: " + !noDiaryEntryToday +")" );
                }
            });

        }]);

}());