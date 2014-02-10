(function () {
    'use strict';


    angular.module('yp.assessment')

        // provides methods to get Assessment Information from the server
        .factory('AssessmentService', ['$http', '$q', 'Restangular', 'principal','$rootScope',
            function ($http, $q, Restangular, principal, $rootScope) {
                var cachedAssessmentPromise;

                $rootScope.$on('$translateChangeStart', function() {
                   cachedAssessmentPromise = null;
                });

                var assService = {
                    getAssessment: function (assessmentId) {
                        // assessments are static from a users perspective, therefore we only load once and cache the promise
                        // in the service.
                        if (!cachedAssessmentPromise) {
                            cachedAssessmentPromise = Restangular.one('assessments', assessmentId).get().then(function (assessment) {
                                // sort questions into keyed lookup so all controllers can easily get the question for a given
                                // questionId
                                assessment.questionLookup = {};
                                _.forEach(assessment.questionCats, function (questionCat) {
                                    _.forEach(questionCat.questions, function (question) {
                                        assessment.questionLookup[question.id] = question;
                                    });
                                });
                                return assessment;
                            });
                        }
                        return cachedAssessmentPromise;
                    },
                    reloadAssessment: function() {
                        cachedAssessmentPromise = undefined;
                    },
                    getAssessmentData: function (assessmentId) {
                        var assessmentBase = Restangular.one('assessments', assessmentId);
                        // if the user is authenticated we try to get his previous answers from the server,
                        // if unauthenticated, we only get the assessment
                        var neededCalls = [assService.getAssessment(assessmentId)];
                        if (principal.isAuthenticated()) {
                            neededCalls.push(
                                assessmentBase.one('results/newest').get()
                            );
                        }
                        // run the one/two calls in parallel and then processes the results
                        return $q.all(neededCalls).then(function (results) {
                            var assessment = results[0];

                            // check whether we got saved answers for this user and this assessment
                            var assResult;
                            if (results[1]) {
                                assResult = results[1];
                                // convert into a new Result, otherwise we overwrite the old one
                                delete assResult.id;
                            } else {
                                // got no answers from server, need to generate default answers
                                assResult = assessment.getNewEmptyAssResult();
                            }

                            // sort answers into keyed object (by question_id) to ease access by view
                            assResult.keyedAnswers = {};
                            _.forEach(assResult.answers, function (myAnswer) {
                                assResult.keyedAnswers[myAnswer.question] = myAnswer;
                            });

                            // return both, assessment and assResult in a simple object
                            return {
                                assessment: assessment,
                                result: assResult
                            };
                        });
                    },
                    postResults: function (assResult, callback) {
//                        ActivityService.invalidateRecommendations();
                        var assessmentResultBase = Restangular.one('assessments', assResult.assessment).all('results');
                        assessmentResultBase.post(assResult).then(callback);
                    },
                    getAssessmentResults: function (assessmentId, sortBy) {
                        sortBy = sortBy || 'timestamp:-1';

                        if (principal.isAuthenticated()) {
                            return Restangular.one('assessments', assessmentId).all('results').getList({sort: sortBy});
                        } else {
                            var deferred = $q.defer();
                            deferred.resolve([]);
                            return deferred.promise;
                        }
                    },
                    getNewestAssessmentResults: function (assessmentId) {
                        if (principal.isAuthenticated()) {
                            return Restangular.one('assessments', assessmentId).one('results/newest').get();
                        } else {
                            var deferred = $q.defer();
                            deferred.resolve([]);
                            return deferred.promise;
                        }
                    },
                    topStressors: function (assessmentId) {
                        return assService.getNewestAssessmentResults('525faf0ac558d40000000005').then(function (result) {
                            if (!result) {
                                return null;
                            } else {
                                return _.sortBy(result.answers,function (answer) {
                                    return -Math.abs(answer.answer);
                                }).slice(0, 3);
                            }
                        });
                    }
                };

                return assService;
            }]);

}());