"use strict";

angular.module('yp.topic', ['ui.router'])

    .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
        function ($stateProvider, $urlRouterProvider, accessLevels) {
            $stateProvider
                .state('topics', {
                    url: "/topics",
                    templateUrl: "partials/topic.html",
                    controller: "TopicController",
                    access: accessLevels.all
                });
        }
    ])

    .factory('TopicService', [function () {
        var myTopicService = {};
        var goals = [];

        myTopicService.setGoal = function (goal) {
            goals.push(goal);
        };
    }])

    .controller('TopicController', ['$scope', function ($scope) {

        $scope.selectedTopic = null;

        $scope.selectTopic = function (topic) {
            $scope.selectedTopic = topic;
        };

        $scope.unselectTopic = function () {
            $scope.selectedTopic = null;
        };

        $scope.setGoal = function () {
            $scope.$state.go('activitylist');
        };

    }]);