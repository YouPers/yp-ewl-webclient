'use strict';

angular.module('yp.cockpit').

    factory('SocialLogService', ['Restangular', function (Restangular) {

        var socialLogBase = Restangular.all('socialevents');

        var SocialLogService = {};

        SocialLogService.getSocialLog = function () {
            return socialLogBase.getList();
        };

        return SocialLogService;
    }])

    .controller('SocialLogCtrl', ['$scope', 'socialLogEntries', function ($scope, socialLogEntries) {

        $scope.socialLogEntries = socialLogEntries;

        $scope.getGlyphicon = function (status) {
            var icon = "";
            if (status === "newMessage") {
                icon = "envelope";
            } else if (status === "readMessage") {
                icon = "ok";
            } else {
                icon = "star";
            }
            return icon;
        };


    }]);
    
