'use strict';

angular.module('yp.sociallog', []).

    factory('SocialLogService', ['$http', function ($http) {

        var socialLogService = {};

        var socialLogEntries = $http.get('js/mockdata/testsociallog.json').then(function (result) {
            return result.data;
        })

        socialLogService.getSocialLog = function () {
            return socialLogEntries;
        }

        return socialLogService;
    }
    ])

    .controller('SocialLogCtrl', ['$scope', 'SocialLogService', function ($scope, SocialLogService) {

        $scope.socialLogEntries = SocialLogService.getSocialLog();

        $scope.getGlyphicon = function(status) {
            var icon = "";
            if (status == "newMessage") {
                icon = "envelope";
            } else if (status == "readMessage") {
                icon = "ok";
            } else {
                icon = "star";
            }
            return icon;
        }

    }])
    
