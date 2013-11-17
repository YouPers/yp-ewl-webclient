'use strict';

angular.module('yp.ewl.stresslevel.linechart', ['yp.ewl.assessment'])

    .controller('yp.ewl.stresslevel.linechart.controller', ['$scope', '$timeout', 'AssessmentService', function ($scope, $timeout, AssessmentService) {

        AssessmentService.getAssessmentResults('525faf0ac558d40000000005', 'timestamp:1')
            .then(function (result) {
                $scope.generalStressLevelValues = [];
                if (result) {
                    if (result.length > 0) {
                        angular.forEach(result, function (resultEntry) {
                            angular.forEach(resultEntry.answers, function (question) {
                                if (question.question === "5278c51a6166f2de240000df") {
                                    $scope.generalStressLevelValues.push(question.answer);
                                }
                            });
                        });
                    }
                }
            });


        $scope.d3Options = {
            chartHeight: 127
        };


    }]);
