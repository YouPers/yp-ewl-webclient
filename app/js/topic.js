/**
 * Created with IntelliJ IDEA.
 * User: retoblunschi
 * Date: 13.09.13
 * Time: 09:45
 * To change this template use File | Settings | File Templates.
 */
"use strict";

angular.module('yp.topic', ['ui.router'])

    .factory('TopicService', [function () {
        var myTopicService = {};

        var goals = [];


        myTopicService.setGoal = function(goal) {
            goals.push (goal);
        };


    }])

    .controller ('TopicController', ['$scope', '$state',    function($scope, $state) {

        $scope.selectedTopic = null;

        $scope.selectTopic = function (topic) {
            $scope.selectedTopic = topic;
        };

        $scope.unselectTopic = function () {
            $scope.selectedTopic = null;
        };

        $scope.setGoal = function () {
            $state.go('actionlist');
        };

    }]);