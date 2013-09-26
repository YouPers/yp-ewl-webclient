'use strict';

angular.module('yp.sociallog', []).

    factory('SocialLogService', ['$http', function ($http) {

        var SocialLogService = {};

        var socialLogEntries = $http.get('sociallog').then(function (result) {
            return result.data;
        });

        SocialLogService.getSocialLog = function () {
            return socialLogEntries;
        };

        var socialLogVisible = true;

        SocialLogService.getSocialLogVisibility = function () {
            return socialLogVisible;
        };

        return SocialLogService;
    }
    ])

    .controller('SocialLogCtrl', ['$scope', 'SocialLogService', function ($scope, SocialLogService) {

        $scope.socialLogEntries = SocialLogService.getSocialLog();

        $scope.socialLogVisible = SocialLogService.getSocialLogVisibility();

        $scope.toggleInstruction = function () {
            if ($scope.socialLogVisible === true) {
                return "HIDE_SOCIAL_LOG";
            } else {
                return "SHOW_SOCIAL_LOG";
            }
        };

        $scope.getGlyphicon = function(status) {
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
    
