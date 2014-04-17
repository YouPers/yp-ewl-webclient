(function () {
    'use strict';

    angular.module('yp.dhc.focus',
        [
            'ui.router'
        ])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('focus', {
                        templateUrl: "layout/default.html",
                        access: accessLevels.all
                    })
                    .state('focus.content', {
                        url: "/focus",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dhc/focus/focus.html',
                                controller: 'FocusController'
                            }
                        },
                        resolve: {
                            assessmentResult: ['AssessmentService', function(AssessmentService) {
                                return AssessmentService.getNewestAssessmentResults('525faf0ac558d40000000005');
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/focus/focus');
            }])

        .controller('FocusController', [ '$scope', 'assessmentResult',
            function ($scope, assessmentResult) {

                $scope.needForAction = assessmentResult.needForAction;

                $scope.categories = [
                    'work',
                    'leisure',
                    'handling',
                    'stresstypus'
                ];

                $scope.needForActionClass = function(category) {


                    var need = $scope.needForAction[category];

                    var level = !need || need < 1 ? "none" :
                        need < 4 ? "low" :
                            need < 7 ? "medium" : "high";

                    var obj  = {};
                    obj[level] = true;
                    return obj;

                }
                $scope.needForActionStyle = function(category) {
                    return {
                        width: $scope.needForAction[category] * 10 * 0.6 + '%'
                    };
                }

            }
        ]);

}());