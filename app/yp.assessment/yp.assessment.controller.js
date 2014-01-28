(function () {
    'use strict';


    angular.module('yp.assessment')

        // Controller to display an assessment and process the answers
        // assessmentData is resolved on stateTransfer
        .controller('AssessmentCtrl', ['$scope', '$rootScope', 'assessmentData', 'AssessmentService',
            function ($scope, $rootScope, assessmentData, AssessmentService) {

                $scope.assessment = assessmentData.assessment;
                $scope.result = assessmentData.result;
                $scope.assAnswersByQuestionId = assessmentData.result.keyedAnswers;

                $scope.assessmentDone = function () {
                    if (!$scope.principal.isAuthenticated()) {
                        $rootScope.$broadcast('loginMessageShow');
                    } else {
                        assessmentData.result.timestamp = new Date();
                        assessmentData.result.owner = $scope.principal.getUser().id;
                        delete assessmentData.result.id;

                        AssessmentService.postResults(assessmentData.result, function (result) {
                            console.log("result posted: " + result);
                            $scope.$state.go('assessmentResult', {assessmentId: $scope.assessment.id});
                        });

                    }
                };

                $scope.setQuestionAnswered = function (questionid) {
                    $scope.assAnswersByQuestionId[questionid].dirty = true;
                };

            }])

        // Controller to display assessment Results
        .controller('AssessmentResultCtrl', ['$scope', '$rootScope', 'assessment', 'assessmentResults',
            function ($scope, $rootScope, assessment, assessmentResults) {
                if (!assessmentResults[0]) {
                    var msg = "no result found, should be impossible at this place";
                    console.log(msg);
                    throw new Error(msg);
                }

                // sort the answers of the first result into order
                assessmentResults[0].answers = _.sortBy(assessmentResults[0].answers, function (answer) {
                    return -Math.abs(answer.answer);
                });
                $scope.results = assessmentResults;
                $scope.assessment = assessment;

            }
        ]);

}());