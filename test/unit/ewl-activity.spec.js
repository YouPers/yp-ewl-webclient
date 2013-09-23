'use strict';

/* jasmine specs for filters go here */

describe('ewl activity', function () {
    beforeEach(angular.mock.module('yp.ewl.activity'));
    beforeEach(module('ui.router'));


    describe('ActivityService', function () {

        it('allActivities should be defined and loadable', inject(function (ActivityService) {
            expect(ActivityService.allActivities).toBeDefined();
            expect(ActivityService.plannedActivities).toBeDefined();
        }));
    });

    describe('ActivityListFilter', function () {
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


        it('should exist an ActivityListFilter', inject(function ($filter) {
            expect($filter('ActivityListFilter')).toBeDefined();
        }));

        it('should return all activities when filter is null', inject(function ($filter) {
            var input = [
                {}
            ];
            var filtered = $filter('ActivityListFilter')(input, null);
            expect(filtered.length).toEqual(input.length);
        }));

        it('should return all activities with default filter', inject(function ($filter) {
            var filtered = $filter('ActivityListFilter')(myActivities, myQuery);
            expect(filtered.length).toEqual(myActivities.length);
        }));


        it('should filter by single topic', inject(function ($filter) {
            myQuery.topic.nutrition = true;
            var filtered = $filter('ActivityListFilter')(myActivities, myQuery);
            expect(filtered.length).toEqual(myActivities.length - 1);

            // reset and check if resetted
            myQuery.topic.nutrition = false;
            filtered = $filter('ActivityListFilter')(myActivities, myQuery);
            expect(filtered.length).toEqual(myActivities.length);
        }));

        it('should filter by single cluster', inject(function ($filter) {
            myQuery.cluster.nutrition = true;
            var filtered = $filter('ActivityListFilter')(myActivities, myQuery);
            expect(filtered.length).toEqual(myActivities.length - 1);

            // reset and check if resetted
            myQuery.cluster.nutrition = false;
            filtered = $filter('ActivityListFilter')(myActivities, myQuery);
            expect(filtered.length).toEqual(myActivities.length);
        }));

        it('should filter by single rating', inject(function ($filter) {
            myQuery.rating.four = true;
            var filtered = $filter('ActivityListFilter')(myActivities, myQuery);
            expect(filtered.length).toEqual(1);

            // reset and check if resetted
            myQuery.rating.four = false;
            filtered = $filter('ActivityListFilter')(myActivities, myQuery);
            expect(filtered.length).toEqual(myActivities.length);
        }));

        it('should filter by two ratings', inject(function ($filter) {
            myQuery.rating.four = true;
            myQuery.rating.three = true;

            var filtered = $filter('ActivityListFilter')(myActivities, myQuery);
            expect(filtered.length).toEqual(2);


            // reset and check if resetted
            myQuery.rating.four = false;
            myQuery.rating.three = false;
            filtered = $filter('ActivityListFilter')(myActivities, myQuery);
            expect(filtered.length).toEqual(myActivities.length);
        }));

        it('should filter by duration', inject(function () {
        }));

    });


    describe('ActivityListCtrl', function ($state) {
        var $scope = null;
        var ctrl = null;

        /* IMPORTANT!
         * this is where we're setting up the $scope and
         * calling the controller function on it, injecting
         * all the important bits, like our mockService */
        beforeEach(inject(function ($rootScope, $controller, $state) {

            //create a scope object for us to use.
            $scope = $rootScope.$new();

            //now run that scope through the controller function,
            //injecting any services or other injectables we need.
            ctrl = $controller('ActivityListCtrl', {
                $scope: $scope,
                $state: $state,
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

                    isActivityPlanned: function (plannedActivities, actionId) {
                        if (typeof (plannedActivities) != 'undefined') {
                            for (var i = 0; i < plannedActivities.length; i++) {
                                if (plannedActivities[i].action_id == actionId) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }
                }
            });
        }));

        it('should have access to all activities and the planned activities', inject(function () {

            expect($scope.isActivityPlanned(1)).toBeFalsy();

            expect($scope.plannedActivities.length).toEqual(1);
        }));


        it('should return the cluster name for an id', inject(function () {
            expect($scope.getClusterName('Nutrition')).toBeDefined();
            expect(typeof $scope.getClusterName('Nutrition')).toEqual('string');
            expect($scope.getClusterName('Nutrition').length).toBeGreaterThan(0);
        }));

        it('should return whether an Acitvity is planned or not', inject(function () {
            var myActivity = {
                id: "2",
                field: 'myField'
            };
            expect($scope.isActivityPlanned(myActivity.id)).toBeTruthy();

           myActivity.id = "3";
            expect($scope.isActivityPlanned(myActivity.id)).toBeFalsy();

        }));
    });
});
