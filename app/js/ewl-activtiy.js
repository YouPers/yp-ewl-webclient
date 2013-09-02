'use strict';

angular.module('yp.ewl.activity', []).


    factory('ActivityService', ['$http', function ($http) {


        function Activity(id, title, text, af, plCat) {
            this.id = id;
            this.title = title;
            this.text = text;
            this.field = af;
            this.planningCat = plCat;
        }

        var activityProposals = $http.get('js/mockdata/testactivities.json').then(function (result) {
            return result.data;
        });

        var plannedActivities = $http.get('js/mockdata/testplannedactivities.json').then(function (result) {
            return result.data;
        });


        var actService = {
            allActivities: activityProposals,
            plannedActivities: plannedActivities
        };

        return actService;
    }])

    .controller('ActivityCtrl', [ '$scope', 'ActivityService', '$timeout',

        function ($scope, activityService, $timeout) {

            $scope.actionFieldSelected = "";

            activityService.allActivities.then(function (data) {
                $scope.actions = data;
            });

            activityService.plannedActivities.then(function (data) {
                $scope.myPlannedActions = data;
            });

            $scope.unPlanAction = function(action) {
                for (var i = 0; i < $scope.myPlannedActions.length; i++) {
                    if ($scope.myPlannedActions[i].action_id === action.id) {
                        $scope.myPlannedActions.splice(i,1);
                    }
                }
            }

            $scope.planAction = function (action) {
                var newAction = true;

                // check whether this activity is already planned, if so, do replace the plan
                // if not, add it
                for (var i = 0; i < $scope.myPlannedActions.length; i++) {
                    if ($scope.myPlannedActions[i].action_id === action.id) {

                        $scope.myPlannedActions[i] = {
                            action_id: action.id,
                            field: action.field
                        };
                        newAction = false;
                    }
                }
                if (newAction) {
                    $scope.myPlannedActions.push({
                        action_id: action.id,
                        field: action.field
                    })
                }
            };

            $scope.dt = null;

            $scope.showWeeks = false;

            $scope.minDate = new Date();

            $scope.open = function () {
                $timeout(function () {
                    $scope.opened = true;
                });
            };

            $scope.dateOptions = {
                'year-format': "'yy'",
                'starting-day': 1
            };


            $scope.isActionPlanned = function (actionId) {
                for (var i = 0; i < $scope.myPlannedActions.length; i++) {
                    if ($scope.myPlannedActions[i].action_id == actionId) {
                        return true;
                    }
                }
                return false;
            };


            $scope.selectActionField = function (actionField) {
                $scope.actionFieldSelected = actionField;
            };

        } ]);
