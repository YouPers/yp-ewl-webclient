(function () {
    'use strict';

    angular.module('yp.dhc.diary')


        .factory('DiaryService', ['$http', 'Restangular', '$q', 'UserService', '$rootScope',
            function ($http, Restangular, $q, UserService, $rootScope) {

                var diaryService = {
                    getEntries: function (params) {
                        // we can no longer assume, that activities are static because campaign leads can create new campaign
                        return Restangular.all('diaryentries').getList(params);
                    }
                };

                return diaryService;
            }]);

}());