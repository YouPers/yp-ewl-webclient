(function () {
    'use strict';

    angular.module('yp.components.assessment', ['yp.components.user'])


        // Object methods for all Assessment related objects
        .run(['Restangular', function (Restangular) {
            Restangular.extendModel('assessments', function (assessment, user) {

                assessment.getNewEmptyAssResult = function () {
                    var emptyResult = {
                        assessment: assessment.id,
                        answers: []
                    };
                    _.forEach(assessment.questions, function(question) {
                        var answer = {
                            assessment: assessment.id,
                            question: question.id || question,
                            answer: null
                        };
                        emptyResult.answers.push(answer);
                    });
                    return emptyResult;

                };
                return assessment;
            });
        }])


        // hardcoded filtering out of general stress level
        // todo: replacing hardcoded question id
        .filter('stripGeneralLevel', function () {
            return function (input) {
                var output = [];
                for (var i = 0; i < input.length; i++) {
                    if (input[i].question !== "5278c51a6166f2de240000df") {
                        output.push(input[i]);
                    }
                }
                return output;
            };
        });

})();