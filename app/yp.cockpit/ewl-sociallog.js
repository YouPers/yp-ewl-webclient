'use strict';

angular.module('yp.sociallog', ['restangular']).

    factory('SocialLogService', ['Restangular', function (Restangular) {

        var socialLogBase = Restangular.all('socialevents');

        var SocialLogService = {};

        SocialLogService.getSocialLog = function () {
            return socialLogBase.getList();
        };

        return SocialLogService;
    }
    ])

    .controller('SocialLogCtrl', ['$scope', 'SocialLogService', function ($scope, SocialLogService) {

        SocialLogService.getSocialLog().then(function (result) {
            $scope.socialLogEntries = result;
        });

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
    
