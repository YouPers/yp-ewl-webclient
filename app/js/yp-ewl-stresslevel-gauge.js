'use strict';

angular.module('yp.ewl.stresslevel.gauge', ['yp.ewl.assessment'])

    .controller('yp.ewl.stresslevel.gauge.controller', ['$scope', '$timeout', 'AssessmentService', function ($scope, $timeout, AssessmentService) {

        $scope.currentStressLevel = 0;
        $scope.latestAssessment = {};

        AssessmentService.getAssessmentResults('525faf0ac558d40000000005')
            .then(function (result) {
                var currentStressLevel = 0;
                $scope.topStressFactors = [];
                var nOfTopStressFactorsToShow = 3;
                if (result) {
                    if (result.length > 0) {
                        $scope.latestAssessment = result[0];
                        angular.forEach($scope.latestAssessment.answers, function (question) {
                            if (question.question === "5278c51a6166f2de240000df") {
                                currentStressLevel = question.answer;
                            } else {
                                if ($scope.topStressFactors.length < nOfTopStressFactorsToShow) {
                                    AssessmentService.getAssessment('525faf0ac558d40000000005')
                                        .then(function (result) {
                                            if (result) {
                                                var xy = result.questionLookup[question.question].title;
                                                $scope.topStressFactors.push({ "label": xy, "level": question.answer});
                                            }
                                        });
                                }
                            }
                        });
                    }
                }
                $scope.currentStressLevel = currentStressLevel;

                $scope.stressLevelGeneral = { "label" : "Allgemein", "level" : $scope.currentStressLevel};

                $scope.variance = false;

            });

        $scope.d3Options = {
            size: 100
        };

        $scope.gauge = {};

    }]);
