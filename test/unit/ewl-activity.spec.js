'use strict';

/* jasmine specs for filters go here */

describe('ewl activity', function () {
    beforeEach(module('yp.ewl.activity'));


    describe('ActivityService', function () {

        it('allActivities should be defined and loadable', inject(function (ActivityService) {
            expect(ActivityService.allActivities).toBeDefined();
            expect(ActivityService.plannedActivities).toBeDefined();
        }));
    });

    describe('ActivityCtrl', function () {
        var $scope = null;
        var ctrl = null;

        /* IMPORTANT!
         * this is where we're setting up the $scope and
         * calling the controller function on it, injecting
         * all the important bits, like our mockService */
        beforeEach(inject(function ($rootScope, $controller, $timeout, $q) {

            //create a scope object for us to use.
            $scope = $rootScope.$new();

            //now run that scope through the controller function,
            //injecting any services or other injectables we need.
            ctrl = $controller('ActivityCtrl', {
                $scope: $scope,
                ActivityService: {
                    allActivities: {
                        then: function (callback) {
                            callback({
                                    "id": "1",
                                    "title": "Iss täglich einen Apfel",
                                    "text": "Früchte sind superduper und darum sollte man immer eine essen...",
                                    "field": "nutrition",
                                    "planningCat": "daily"
                                },
                                {
                                    "id": "2",
                                    "title": "Joggen über Mittag",
                                    "text": "Run forest, Run...",
                                    "field": "exercise",
                                    "planningCat": "daily"
                                })
                        }
                    },


                    plannedActivities: {
                        then: function (callback) {
                            callback([
                                {
                                    "action_id": 2,
                                    "field": "exercise"
                                }
                            ]
                            )
                        }
                    }
                },
                $timeout: $timeout
            });
        }));

        it('should mark an action as planned, but only once per action', inject(function () {

            expect($scope.isActionPlanned(1)).toBeFalsy();

            expect($scope.myPlannedActions.length).toEqual(1);

            $scope.planAction({
                id: 1,
                field: 'nutrition'
            })

            expect($scope.isActionPlanned(1)).toBeTruthy();
            expect($scope.myPlannedActions.length).toEqual(2);
            $scope.planAction({
                id: 1,
                field: 'nutrition'
            })
            expect($scope.myPlannedActions.length).toEqual(2);
        }));


        it('should check whether an action is planned', inject(function () {
            var myAction = {
                id: 37,
                field: 'myField'
            }

            expect($scope.isActionPlanned(myAction.id)).toBeFalsy();
            $scope.planAction(myAction);
            expect($scope.isActionPlanned(myAction.id)).toBeTruthy();
            $scope.planAction(myAction);

            expect($scope.isActionPlanned(myAction.id)).toBeTruthy();

            $scope.unPlanAction(myAction);
            expect($scope.isActionPlanned(myAction.id)).toBeFalsy();

        }))

        describe('unPlan Action', function () {
            it('should remove an action from the planned actions', inject(function () {
                var myAction = {
                    id: 37,
                    field: 'myField'
                }
                expect($scope.isActionPlanned(myAction.id)).toBeFalsy();
                $scope.planAction(myAction);
                expect($scope.isActionPlanned(myAction.id)).toBeTruthy();
                $scope.unPlanAction(myAction);
                expect($scope.isActionPlanned(myAction.id)).toBeFalsy();
                $scope.unPlanAction(myAction);
                expect($scope.isActionPlanned(myAction.id)).toBeFalsy();

            }))
        })
    });
});
