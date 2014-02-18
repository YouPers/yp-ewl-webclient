"use strict";

angular.module('yp.topic', ['ui.router', 'restangular', 'yp.user'])

    .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
        function ($stateProvider, $urlRouterProvider, accessLevels) {
            $stateProvider
                .state('topics', {
                    url: "/topics",
                    templateUrl: "yp.ewl/yp.topic.html",
                    controller: "TopicController",
                    access: accessLevels.all
                })
                .state('startCampaign', {
                    url: "/campaigns/:campaignId/start",
                    templateUrl: "yp.ewl/yp.topic.setgoal.html",
                    controller: "TopicSetGoalCtrl",
                    access: accessLevels.all,
                    resolve: {
                        campaign: ['Restangular', '$stateParams', 'UserService',
                            function (Restangular, $stateParams, UserService) {
                            return Restangular.one('campaigns', $stateParams.campaignId).get().then(function success (campaign) {

                                // set the campaign on the current user
                                if (campaign) {
                                    UserService.principal.getUser().campaign = campaign.id;

                                    // if this is an authenticated user (e.g. a stored one, that already exists on the backend)
                                    // we need to save it, because we have just updated it.
                                    if (UserService.principal.isAuthenticated()) {

                                        UserService.putUser(UserService.principal.getUser()).then(function sucess(result){
                                            return result;
                                        }, function error (err) {
                                            console.log(err);
                                            return err;
                                        });
                                    }
                                }
                                return campaign;
                            }, function error (err) {
                                console.log(err);
                                return;
                            });
                        }]
                    }
                });

        }
    ])

    .
    factory('TopicService', [function () {
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

    .controller('TopicSetGoalCtrl', ['$scope', 'campaign', function ($scope, campaign) {
        $scope.campaign = campaign;
    }]);

