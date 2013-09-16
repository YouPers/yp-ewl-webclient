'use strict';

/* jasmine specs for filters go here */

describe('ewl activity', function () {
    beforeEach(angular.mock.module('yp.ewl.activity'));


    describe('ActionService', function () {

        it('allActivities should be defined and loadable', inject(function (ActionService) {
            expect(ActionService.allActivities).toBeDefined();
            expect(ActionService.plannedActivities).toBeDefined();
        }));
    });

    describe('ActionListFilter', function () {
        var myActivities = [
            {
                "id": "1",
                "title": "Iss täglich einen Apfel",
                "text": "Früchte sind superduper und darum sollte man immer eine essen...",
                "field": ["nutrition"],
                "topic": ["workLifeBalance", "nutrition"],
                "defaultPlanType": "daily",
                "defaultExecutionType": "self",
                "defaultPrivacy": "public",
                "rating": 2
            },
            {
                "id": "2",
                "title": "Joggen über Mittag",
                "text": "Run forest, Run...",
                "field": ["fitness"],
                "topic": ["workLifeBalance", "physicalFitness"],
                "defaultPlanType": "weekly",
                "defaultExecutionType": "group",
                "defaultPrivacy": "public",
                "rating": 3
            },
            {
                "id": "3",
                "title": "Iss täglich einen Apfel",
                "text": "Früchte sind superduper und darum sollte man immer eine essen...",
                "field": ["nutrition"],
                "topic": ["workLifeBalance", "nutrition"],
                "defaultPlanType": "daily",
                "defaultExecutionType": "self",
                "defaultPrivacy": "public",
                "rating": 4
            }
        ];

        var myQuery = {
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
            },
            topic: {
                workLifeBalance: false,
                physicalFitness: false,
                nutrition: false,
                mentalFitness: false
            }
        };


        it('should exist an ActionListFilter', inject(function ($filter) {
            expect($filter('ActionListFilter')).toBeDefined();
        }));

        it('should return all activities when filter is null', inject(function ($filter) {
            var input = [{}];
            var filtered = $filter('ActionListFilter')(input,null );
            expect(filtered.length).toEqual(input.length);
        }));

        it('should return all activities with default filter', inject(function ($filter) {
            var filtered = $filter('ActionListFilter')(myActivities, myQuery);
            expect(filtered.length).toEqual(myActivities.length);
        }));



        it('should filter by single topic', inject(function ($filter) {
            myQuery.topic.nutrition = true;
            var filtered = $filter('ActionListFilter')(myActivities, myQuery);
            expect(filtered.length).toEqual(myActivities.length -1);

            // reset and check if resetted
            myQuery.topic.nutrition = false;
            filtered = $filter('ActionListFilter')(myActivities, myQuery);
            expect(filtered.length).toEqual(myActivities.length);
        }));

        it('should filter by single cluster', inject(function ($filter) {
            myQuery.cluster.nutrition = true;
            var filtered = $filter('ActionListFilter')(myActivities, myQuery);
            expect(filtered.length).toEqual(myActivities.length -1);

            // reset and check if resetted
            myQuery.cluster.nutrition = false;
            filtered = $filter('ActionListFilter')(myActivities, myQuery);
            expect(filtered.length).toEqual(myActivities.length);
        }));

        it('should filter by single rating', inject(function ($filter) {
            myQuery.rating.four = true;
            var filtered = $filter('ActionListFilter')(myActivities, myQuery);
            expect(filtered.length).toEqual(1);

            // reset and check if resetted
            myQuery.rating.four = false;
            filtered = $filter('ActionListFilter')(myActivities, myQuery);
            expect(filtered.length).toEqual(myActivities.length);
        }));

        it('should filter by two ratings', inject(function ($filter) {
            myQuery.rating.four = true;
            myQuery.rating.three = true;

            var filtered = $filter('ActionListFilter')(myActivities, myQuery);
            expect(filtered.length).toEqual(2);


            // reset and check if resetted
            myQuery.rating.four = false;
            myQuery.rating.three = false;
            filtered = $filter('ActionListFilter')(myActivities, myQuery);
            expect(filtered.length).toEqual(myActivities.length);
        }));

        it('should filter by duration', inject(function () {
        }));

    });

    describe('ActivityFieldCtrl', function () {
        var $scope = null;
        var ctrl = null;

        /* IMPORTANT!
         * this is where we're setting up the $scope and
         * calling the controller function on it, injecting
         * all the important bits, like our mockService */
        beforeEach(inject(function ($rootScope, $controller) {

            //create a scope object for us to use.
            $scope = $rootScope.$new();

            //now run that scope through the controller function,
            //injecting any services or other injectables we need.
            ctrl = $controller('ActivityFieldCtrl', {
                $scope: $scope,
                ActionService: {
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
                                });
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
                            );
                        }
                    },

                    isActionPlanned: function (plannedActions, actionId) {
                        if (typeof (plannedActions) != 'undefined') {
                            for (var i = 0; i < plannedActions.length; i++) {
                                if (plannedActions[i].action_id == actionId) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }
                }
            });
        }));

        it('should mark an action as planned, but only once per action', inject(function () {

            expect($scope.isActionPlanned(1)).toBeFalsy();

            expect($scope.myPlannedActions.length).toEqual(1);

            $scope.planAction({
                id: 1,
                field: 'nutrition'
            });

            expect($scope.isActionPlanned(1)).toBeTruthy();
            expect($scope.myPlannedActions.length).toEqual(2);
            $scope.planAction({
                id: 1,
                field: 'nutrition'
            });
            expect($scope.myPlannedActions.length).toEqual(2);
        }));


        it('should check whether an action is planned', inject(function () {
            var myAction = {
                id: 37,
                field: 'myField'
            };

            expect($scope.isActionPlanned(myAction.id)).toBeFalsy();
            $scope.planAction(myAction);
            expect($scope.isActionPlanned(myAction.id)).toBeTruthy();
            $scope.planAction(myAction);

            expect($scope.isActionPlanned(myAction.id)).toBeTruthy();

            $scope.unPlanAction(myAction);
            expect($scope.isActionPlanned(myAction.id)).toBeFalsy();

        }));

        describe('unPlan Action', function () {
            it('should remove an action from the planned actions', inject(function () {
                var myAction = {
                    id: 37,
                    field: 'myField'
                };
                expect($scope.isActionPlanned(myAction.id)).toBeFalsy();
                $scope.planAction(myAction);
                expect($scope.isActionPlanned(myAction.id)).toBeTruthy();
                $scope.unPlanAction(myAction);
                expect($scope.isActionPlanned(myAction.id)).toBeFalsy();
                $scope.unPlanAction(myAction);
                expect($scope.isActionPlanned(myAction.id)).toBeFalsy();

            }));
        });
    });
});
