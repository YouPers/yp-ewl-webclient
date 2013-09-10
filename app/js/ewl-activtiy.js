'use strict';

angular.module('yp.ewl.activity', [])


    .factory('ActionService', ['$http', function ($http) {


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
        };

        var selectedActivityPlan = {
            "action_id": 1,
            "field": "exercise",
            "planType": "unplanned",
            "onceDate": "",
            "onceTime": "",
            "weeklyDay": ""
        };

        var actService = {
            allActivities: activityProposals,
            plannedActivities: plannedActivities,
            getSelectedActivity: function () {
                return selectedActivity;
            },
            getSelectedActivityPlan: function () {
                return selectedActivityPlan;
            },

            setSelectedActivity: function (actionId, allActions, plannedActions) {
                if (plannedActions && allActions) {
                selectedActivity = _.find(allActions, function (obj) {
                    return obj.id == actionId;
                });

                selectedActivityPlan = _.find(plannedActions, function (obj) {
                    return obj.action_id == actionId;
                })
                } else {
                    selectedActivity ={};
                    selectedActivityPlan ={};
                }
            },

            isActionPlanned: function(plannedActions, actionId) {
                if (typeof (plannedActions) != 'undefined')  {
                    for (var i = 0; i < plannedActions.length; i++) {
                        if (plannedActions[i].action_id == actionId) {
                            return true;
                        }
                    }
                }
                return false;
            }

        };

        return actService;
    }])

    .filter('ActionListFilter', function () {
        return function (actions, query) {
            var out = [];

            var allClusters = true;
            angular.forEach(query.cluster, function(value, key) {
                if (value) {
                    allClusters = false;
                }
            });


            var allRatings = true;
            angular.forEach(query.rating, function(value, key) {
                if (value) {
                    allRatings = false;
                }
            });

            var ratingsMapping = ['none', 'one', 'two', 'three','four', 'five']
            var allTimes = true;
            angular.forEach(query.times, function(value, key) {
                if (value) {
                    allTimes = false;
                }
            });


            angular.forEach(actions, function(action, key) {

                if (   (allClusters || query.cluster[action.field]) &&
                       (allRatings  || query.rating[ratingsMapping[action.rating]]) &&
                       (allTimes || query.time[action.time]))
                    out.push(action);
                }
             )
            return out;

        }
    }
    )

    .filter('startFrom', function () {
        return function (input, start) {
            start = +start; //parse to int
            return input.slice(start);
        };
    })

    .controller('ActivityFieldCtrl', [ '$scope', 'ActionService', function ($scope, ActionService) {

        $scope.actionFieldSelected = "";

       ActionService.allActivities.then(function (data) {
            $scope.actions = data;
        });

        ActionService.plannedActivities.then(function (data) {
            $scope.myPlannedActions = data;
        });

        $scope.unPlanAction = function (action) {
            for (var i = 0; i < $scope.myPlannedActions.length; i++) {
                if ($scope.myPlannedActions[i].action_id === action.id) {
                    $scope.myPlannedActions.splice(i, 1);
                }
            }
        };

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
            return ActionService.isActionPlanned($scope.myPlannedActions, actionId);
        };


        $scope.selectActionField = function (actionField) {
            $scope.actionFieldSelected = actionField;
        };

    } ])

    .controller('ActivityCtrl', ['$scope', 'ActionService', '$timeout', '$stateParams', 'allActions', 'plannedActions',
        function ($scope, ActionService, $timeout, $stateParams, allActions, plannedActions) {

            $scope.actions = allActions;

            $scope.plannedActions = plannedActions;

        ActionService.setSelectedActivity($stateParams.actionId, $scope.actions, $scope.plannedActions);

        $scope.currentAction = ActionService.getSelectedActivity();
        $scope.currentActionPlan = ActionService.getSelectedActivityPlan();



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

            $scope.isActionPlanned = function (actionId) {
                return ActionService.isActionPlanned($scope.plannedActions, actionId);
            }

        }])

    .controller('ActionListCtrl', ['$scope', 'ActionService', '$filter', function($scope, ActionService, $filter) {
        ActionService.allActivities.then(function (data) {
            $scope.actions = data;
            $scope.filteredActions = data;

        });

        ActionService.plannedActivities.then(function (data) {
            $scope.plannedActions = data;
        });

        $scope.isActionPlanned = function (actionId) {
            return ActionService.isActionPlanned($scope.plannedActions, actionId);
        }


        $scope.query = {
            cluster: {
                general: false,
                fitness: false,
                nutrition: false,
                wellness: false
            },
            rating: {
                five: false,
                four: false,
                three: false,
                two: false,
                one: false
            },
            time: {
                t15: false,
                t30: false,
                t60: false,
                more: false
            }
        }

        $scope.pageSize = 10;
        $scope.maxSize = 5;
        $scope.currentPage = 1;


        $scope.$watch('query', function (newQuery) {
            $scope.currentPage = 1;
            $scope.filteredActions = $filter('ActionListFilter')($scope.actions, $scope.query);
        }, true);
    }])
;

