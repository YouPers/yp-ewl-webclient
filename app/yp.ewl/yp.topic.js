"use strict";

angular.module('yp.topic', ['ui.router', 'restangular'])

    .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
        function ($stateProvider, $urlRouterProvider, accessLevels) {
            $stateProvider
                .state('topics', {
                    url: "/topics",
                    templateUrl: "yp.ewl/yp.topic.html",
                    controller: "TopicController",
                    access: accessLevels.all
                })
                .state('modal_startCampaign', {
                    url: "/campaigns/:campaignId/start",
                    views: {
                        '': {
                            template: "="
                        },
                        modal: {
                            templateUrl: "yp.ewl/yp.topic.setgoal.html",
                            controller: "TopicSetGoalCtrl"
                        }
                    },
                    access: accessLevels.all,
                    resolve: {
                        campaign: ['Restangular', '$stateParams',function(Restangular, $stateParams) {
                            return Restangular.one('campaigns', $stateParams.campaignId);
                        }]
                    }
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

    }])

    .controller('TopicSetGoalCtrl', ['$scope', 'campaign',function($scope, campaign) {
        $scope.campaign = campaign;
    }]);

