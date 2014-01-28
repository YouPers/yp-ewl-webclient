'use strict';

angular.module('yp.evaluate', ['restangular', 'ui.router', 'yp.user', 'yp.activity'])

    .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
        function ($stateProvider, $urlRouterProvider, accessLevels) {
            $stateProvider
                .state('evaluate', {
                    url: "/evaluate",
                    templateUrl: "yp.evaluate/yp.evaluate.html",
                    controller: "EvaluateCtrl",
                    access: accessLevels.all,
                    resolve: {

                    }
                });
        }])
    .controller('EvaluateCtrl', ['$scope', 'UserService', 'ActivityService', 'AssessmentService', 'StatsService',
        function ($scope, UserService, ActivityService, AssessmentService, StatsService) {

            // TODO: enum?
            $scope.statTypes = 'assUpdatesPerDay assTotals topStressors activitiesPlanned activityEvents'.split(' ');

            StatsService.getStats('assUpdatesPerDay').then(function(result) {
                $scope.assUpdatesPerDay = result;
                _.forEach($scope.assUpdatesPerDay, function(item) {
                    // TODO: find better solution, private fields are not accessible in angular, Date object would be more convenient to use
                    item.day = new Date(item._id.year, item._id.month, item._id.day);
                });
            });


            StatsService.getStats('assTotals').then(function(result) {
                $scope.assTotals = result;
            });

            StatsService.getStats('topStressors').then(function(result) {
                $scope.topStressors = result;
                _.forEach($scope.assTotals, function(item) {
                    AssessmentService.getAssessment(item.question).then(function(result) {

                        //console.log(result);

                        //TODO: ask for a brief intro about the data model first, how this kind of queries should be handled and where the results should be stored
                    });
                });
            });

            StatsService.getStats('activitiesPlanned').then(function(result) {
                $scope.activitiesPlanned = result;

                _.forEach($scope.activitiesPlanned, function(item) {

                    ActivityService.getActivity(item.activity).then(function(result) {

                        item.activityResolved = result;

                    });
                });
            });

            StatsService.getStats('activityEvents').then(function(result) {
                $scope.activityEvents = result;
            });


        }])
    .factory('StatsService', ['$http', 'Restangular', '$q', 'principal',
        function ($http, Restangular, $q, principal) {

            var stats = Restangular.all('stats');

            function getStats(type) {
                return stats.getList({type: type});
            }

            var StatsService = {

                getStats: getStats,
                getAssUpdatesPerDay: function() {
                    return getStats('assUpdatesPerDay');
                }
            };

            return StatsService;

        }]);