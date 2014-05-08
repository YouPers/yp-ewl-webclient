(function () {
    'use strict';


    angular.module('yp.assessment')

        // provides methods to get Assessment Information from the server
        .factory('AssessmentService', ['$http', '$q', 'Restangular', 'UserService', '$rootScope',
            function ($http, $q, Restangular, UserService, $rootScope) {
                var cachedAssessmentPromise;

                $rootScope.$on('$translateChangeStart', function () {
                    cachedAssessmentPromise = null;
                });

                var assService = {
                    getAssessment: function (assessmentId) {
                        // assessments are static from a users perspective, therefore we only load once and cache the promise
                        // in the service.
                        if (!cachedAssessmentPromise) {
                            cachedAssessmentPromise = Restangular.one('assessments', assessmentId).get({populate: 'questions'}).then(function (assessment) {
                                // sort questions into keyed lookup so all controllers can easily get the question for a given
                                // questionId
                                assessment.questionLookup = {};
                                _.forEach(assessment.questions, function (question) {
                                    assessment.questionLookup[question.id] = question;
                                });

                                assessment.categories =  _.uniq(_.map(assessment.questions,'category'));
                                return assessment;
                            });
                        }
                        return cachedAssessmentPromise;
                    },
                    reloadAssessment: function () {
                        cachedAssessmentPromise = undefined;
                    },
                    getAssessmentData: function (assessmentId) {
                        var assessmentBase = Restangular.one('assessments', assessmentId);
                        // if the user is authenticated we try to get his previous answers from the server,
                        // if unauthenticated, we only get the assessment
                        var neededCalls = [assService.getAssessment(assessmentId)];
                        if (UserService.principal.isAuthenticated()) {
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

                                // fill up unanswered questions
                                assResult = results[1];
                                var emtpyResult = assessment.getNewEmptyAssResult();

                                _.forEach(emtpyResult.answers, function(emptyAnswer) {
                                    var answerFromBackend = _.find(assResult.answers, function(res) {
                                        return emptyAnswer.question === res.question;
                                    });

                                    if (!answerFromBackend) {
                                        assResult.answers.push(emptyAnswer);
                                    }
                                });

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
                    putAnswer: function(answer) {
                        var assessment = Restangular.one('assessments', answer.assessment);
                        answer.id = answer.question;
                        return Restangular.restangularizeElement(assessment, answer, 'answers').put();
                    },
                    postResults: function (assResult) {

                        $rootScope.$emit('newAssessmentResultsPosted', assResult);
                        var assessmentResultBase = Restangular.one('assessments', assResult.assessment).all('results');
                        return assessmentResultBase.post(assResult);
                    },
                    getAssessmentResults: function (assessmentId, options) {
                        if (!options) {
                            options = {};
                        }
                        options.sortBy = options.sortBy || 'created:-1';

                        if (UserService.principal.isAuthenticated()) {
                            return Restangular.one('assessments', assessmentId).all('results').getList(options);
                        } else {
                            var deferred = $q.defer();
                            deferred.resolve([]);
                            return deferred.promise;
                        }
                    },
                    getNewestAssessmentResults: function (assessmentId, options) {
                        if (UserService.principal.isAuthenticated()) {
                            return Restangular.one('assessments', assessmentId).one('results/newest').get(options);
                        } else {
                            var deferred = $q.defer();
                            deferred.resolve([]);
                            return deferred.promise;
                        }
                    },
                    topStressors: function (assessmentId) {
                        return assService.getNewestAssessmentResults(assessmentId, {populatedeep: 'answers.question'}).then(function (result) {
                            if (!result || result.answers.length < 26) {
                                return null;
                            } else {

                                // allways include user stressors from profile
                                var focus = UserService.principal.getUser().profile.userPreferences.focus;
                                var threshold = 40;

                                var answers = _.filter(result.answers, function(answer) {
                                    return _.any(focus, function(focus) {
                                        return focus.question === answer.question.id;
                                    });
                                });

                                // first, filter out all answers lower than 40 and not already included from the user profile
                                var answersAboveThreshold = _.filter(result.answers, function(answer) {
                                    return Math.abs(answer.answer) > threshold && !_.any(focus, function(focus) {
                                        return focus.question === answer.question.id;
                                    });
                                });

                                var topAnswers = _.sortBy(answersAboveThreshold, function (answer) {
                                    return -Math.abs(answer.answer);
                                }).slice(0, 3);

                                return answers.concat(topAnswers);
                            }
                        });
                    }
                };

                return assService;
            }]);

}());