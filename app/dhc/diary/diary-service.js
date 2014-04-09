(function () {
    'use strict';

    angular.module('yp.dhc.diary')


        .factory('DiaryService', ['$http', 'Restangular', '$q', 'UserService', '$rootScope', 'ProfileService', '$modal',
            function ($http, Restangular, $q, UserService, $rootScope, ProfileService, $modal) {

                var diaryService = {
                    getEntries: function (params) {
                        // we can no longer assume, that activities are static because campaign leads can create new campaign
                        return Restangular.all('diaryentries').getList(params);
                    },
                    saveEntry: function (entry) {
                        return Restangular.all('diaryentries').post(entry);
                    },
                    showDiaryModal: function() {

                        var modalInstance = $modal.open({
                            templateUrl: 'dhc/diary/diary-modal.html',
                            controller: 'DiaryModalController',
                            resolve: {
                                topic: function () {
                                    return "topic.stress";
                                },
                                resolution: function () {
                                    return "In kleinen Schritten mein Verhalten verbessern";
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
                            } else if (result.doNotAskAgainToday) {
                                var profile = UserService.principal.getUser().profile;
                                profile.userPreferences.lastDiaryEntry = moment();
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
                console.log("checking if we should show Diary Modal");
                var profile = UserService.principal.getUser().profile;
                var noDiaryEntryToday = ((!profile.userPreferences.lastDiaryEntry) || moment(profile.userPreferences.lastDiaryEntry).diff(moment()) > 1);
                if (noDiaryEntryToday) {
                    DiaryService.showDiaryModal();
                }
            });

        }]);

}());