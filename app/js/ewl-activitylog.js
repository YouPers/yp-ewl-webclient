'use strict';

angular.module('yp.actionlog', []).

    factory('ActionLogService', ['$http', function ($http) {

        var ActionLogService = {};

        var actionLogEntries = $http.get('js/mockdata/testactionlog.json').then(function (result) {
            return result.data;
        })

        ActionLogService.getActionLog = function () {
            return actionLogEntries;
        }

        return ActionLogService;
    }
    ])

    .controller('ActionLogCtrl', ['$scope', 'ActionLogService', function ($scope, ActionLogService) {

        $scope.actionLogEntries = ActionLogService.getActionLog();

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

//        $scope.getStars = function(num) {
//            var starsArray = new Array();
//            for (var i = 0; i < num; i++) {
//                starsArray[i]=i;
//            }
//            return starsArray;
//        }
//
//        $scope.getEmptyStars = function(num) {
//            var starsArray = new Array();
//            for (var i = 0; i < num; i++) {
//                starsArray[i]=i;
//            }
//            return starsArray;
//        }

        $scope.getGlyphiconStatus = function(status) {
            var icon = "";
            if (status == "done") {
                icon = "ok";
            } else if (status == "not done") {
                icon = "remove";
            } else if (status == "open") {
                icon = "unchecked";
            }
            return icon;
        }

        $scope.getGlyphiconType = function(status) {
            var icon = "";
            if (status == "past") {
                icon = "past";
            } else if (status == "current") {
                icon = "active";
            } else if (status == "future") {
                icon = "";
            }
            return icon;
        }
    }])
