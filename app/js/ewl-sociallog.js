'use strict';

angular.module('yp.sociallog', ['restangular']).

    factory('SocialLogService', ['Restangular', function (Restangular) {

        var SocialLogService = {};

        var commentsBase = Restangular.all('comments');
        var socialLogEntries = commentsBase.getList({populate: 'author'});

        SocialLogService.getSocialLog = function () {
            return socialLogEntries;
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
    
