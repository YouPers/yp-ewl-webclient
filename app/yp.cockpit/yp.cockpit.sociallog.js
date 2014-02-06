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

    .controller('SocialLogCtrl', ['$scope', '$socket', 'socialLogEntries', function ($scope, $socket, socialLogEntries) {

        $scope.socialLogEntries = socialLogEntries;

        $socket.on('social', function (socialLog) {
            console.log('social');
            console.log(socialLog);
            $scope.socialLogEntries.unshift(socialLog);
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
    
