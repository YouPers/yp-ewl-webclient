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

                        AssessmentService.postResults(assessmentData.result).then(function (result) {
                            $scope.$state.go('assessmentResult', {assessmentId: $scope.assessment.id});
                        });

                    }
                };

                $scope.setQuestionAnswered = function (questionid) {
                    $scope.assAnswersByQuestionId[questionid].dirty = true;
                };

            }])

        // Controller to display assessment Results
        .controller('AssessmentResultCtrl', ['$scope', '$rootScope', 'assessment', 'topStressors',
            function ($scope, $rootScope, assessment, topStressors) {
                if (!topStressors) {
                    var msg = "no result found, should be impossible at this place";
                    console.log(msg);
                    throw new Error(msg);
                }

                $scope.topStressors = topStressors;
                $scope.assessment = assessment;

            }
        ]);

}());