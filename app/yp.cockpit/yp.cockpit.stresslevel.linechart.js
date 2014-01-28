'use strict';

angular.module('yp.cockpit')

    .controller('StresslevelLinechartController', ['$scope', '$timeout', 'AssessmentService', function ($scope, $timeout, AssessmentService) {

        AssessmentService.getAssessmentResults('525faf0ac558d40000000005', 'timestamp:1')
            .then(function (result) {
                $scope.generalStressLevelTitle = "";
                $scope.generalStressLevelMinText = "";
                $scope.generalStressLevelMidText = "";
                $scope.generalStressLevelMaxText = "";
                $scope.generalStressLevelValues = [];
                if (result) {
                    if (result.length > 0) {
                        angular.forEach(result, function (resultEntry) {
                            var assessmentDate = new Date(resultEntry.timestamp);
                            angular.forEach(resultEntry.answers, function (question) {
                                if (question.question === "5278c51a6166f2de240000df") {
                                    if ($scope.generalStressLevelTitle.length === 0) {
                                    AssessmentService.getAssessment('525faf0ac558d40000000005')
                                        .then(function (result) {
                                            if (result) {
                                                $scope.generalStressLevelTitle = result.questionLookup[question.question].title;
                                                $scope.generalStressLevelMinText = result.questionLookup[question.question].mintext;
                                                $scope.generalStressLevelMidText = result.questionLookup[question.question].midtext;
                                                $scope.generalStressLevelMaxText = result.questionLookup[question.question].maxtext;
                                            }
                                        });
                                    }
                                    $scope.generalStressLevelValues.push(
                                        { "date": assessmentDate,
                                            "value" : question.answer,
                                        "title": $scope.generalStressLevelTitle});
                                }
                            });
                        });
                    }
                }
            });

        AssessmentService.getAssessment('525faf0ac558d40000000005')
            .then(function (result) {
                if (result) {
                    $scope.generalStressLevelTitle = result.questionLookup["5278c51a6166f2de240000df"].title;
                    $scope.generalStressLevelMinText = result.questionLookup["5278c51a6166f2de240000df"].mintext;
                    $scope.generalStressLevelMidText = result.questionLookup["5278c51a6166f2de240000df"].midtext;
                    $scope.generalStressLevelMaxText = result.questionLookup["5278c51a6166f2de240000df"].maxtext;
                }
                $scope.d3Options = {
                    chartTitle:  $scope.generalStressLevelTitle,
                    chartMinText:  $scope.generalStressLevelMinText,
                    chartMidText:  $scope.generalStressLevelMidText,
                    chartMaxText:  $scope.generalStressLevelMaxText,
                    chartHeight: 127
                };
            });




    }]);
