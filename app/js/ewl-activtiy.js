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

        var selectedActivity = {
            "id": "1",
            "title": "Iss täglich einen Apfel",
            "text": "Früchte sind superduper und darum sollte man immer eine essen...",
            "field": "nutrition",
            "planningCat": "daily"
        }

        var selectedActivityPlan = {
            "action_id": 1,
            "field": "exercise",
            "planType": "unplanned",
            "onceDate": "",
            "onceTime": "",
            "weeklyDay": ""
        }

        var actService = {
            allActivities: activityProposals,
            plannedActivities: plannedActivities,
            getSelectedActivity: function () {
                return selectedActivity;
            },
            setSelectedActivity: function (activity) {
                selectedActivity = activity;
                selectedActivityPlan = _.find(plannedActivities, function (obj){return obj.action_id == activity.id})
            },
            getSelectedActivityPlan: function (){
                return selectedActivityPlan;
            }

        };

        return actService;
    }])

    .controller('ActivityFieldCtrl', [ '$scope', 'ActivityService', '$timeout', function ($scope, activityService) {

        $scope.actionFieldSelected = "";

        activityService.allActivities.then(function (data) {
            $scope.actions = data;
        });

        activityService.plannedActivities.then(function (data) {
            $scope.myPlannedActions = data;
        });

        $scope.unPlanAction = function (action) {
            for (var i = 0; i < $scope.myPlannedActions.length; i++) {
                if ($scope.myPlannedActions[i].action_id === action.id) {
                    $scope.myPlannedActions.splice(i, 1);
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

    } ])

    .controller('ActivityCtrl', ['$scope', 'ActivityService','$timeout', function ($scope, ActivityService, $timeout) {

        $scope.selectedActivity = ActivityService.getSelectedActivity();
        $scope.selectedActivityPlan = ActivityService.getSelectedActivityPlan();

        // one time planning using daypicker
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

        // weeklyplanning using dayselector
        $scope.availableDays = [
            {label: 'MONDAY'},
            {label: 'TUESDAY'},
            {label: 'WEDNESDAY'},
            {label: 'THURSDAY'},
            {label: 'FRIDAY'},
            {label: 'SATURDAY'},
            {label: 'SUNDAY'}
        ];


    }]);

