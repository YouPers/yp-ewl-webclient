(function () {
    'use strict';


    angular.module('yp.components.assessment')


        // provides methods to get Assessment Information from the server
        .factory('AssessmentService', ['$http', '$q', 'Restangular', 'UserService', '$rootScope',
            function ($http, $q, Restangular, UserService, $rootScope) {
                var _cachedAssessmentPromise = {};
                var _answerDirty = false;

                $rootScope.$on('$translateChangeStart', function () {
                    _cachedAssessmentPromise = {};
                });

                function _topicId2Assessment(topicId) {
                    return assService.getAssessment(topicId).then(function (assessment) {
                        return assessment;
                    });
                }

                function completeResultWithZeroAnswers(assessment, assResult) {
                    assResult.missingAnswers = assessment.questions.length - assResult.answers.length;
                    var emtpyResult = assessment.getNewEmptyAssResult();
                    _.forEach(emtpyResult.answers, function (emptyAnswer) {
                        var answerFromBackend = _.find(assResult.answers, function (res) {
                            return emptyAnswer.question === res.question;
                        });

                        if (!answerFromBackend) {
                            assResult.answers.push(emptyAnswer);
                        }
                    });
                }

                var assService = {
                    getAssessment: function (topicId) {
                        if (!topicId) {
                            throw new Error("topicId is required");
                        }

                        if (!_cachedAssessmentPromise[topicId]) {
                            _cachedAssessmentPromise[topicId] =
                                Restangular
                                    .all('assessments')
                                    .getList({populate: 'questions', "filter[topic]": topicId})
                                    .then(function (assessments) {
                                        // sort questions into keyed lookup so all controllers can easily get the question for a given
                                        // questionId
                                        if (assessments.length !== 1) {
                                            throw new Error("we always expect exactly one assessment per topic, got: " + assessments.length);
                                        }

                                        assessments[0].questionLookup = {};
                                        _.forEach(assessments[0].questions, function (question) {
                                            assessments[0].questionLookup[question.id] = question;
                                        });

                                        assessments[0].categories = _.uniq(_.map(assessments[0].questions, 'category'));
                                        return assessments[0];
                                    });
                        }
                        return _cachedAssessmentPromise[topicId];
                    },
                    getAssessmentData: function (options) {
                        var assessmentBase = Restangular.all('assessments');
                        // if the user is authenticated we try to get his previous answers from the server,
                        // if unauthenticated, we only get the assessment
                        var neededCalls = [assessmentBase.getList(options)];
                        if (UserService.principal.isAuthenticated()) {
                            neededCalls.push(
                                assessmentBase.one('results/newest').get()
                            );
                        }
                        // run the one/two calls in parallel and then processes the results
                        return $q.all(neededCalls).then(function (results) {
                            var assessment = results[0][0];

                            // check whether we got saved answers for this user and this assessment
                            var assResult;
                            if (results[1]) {

                                // fill up unanswered questions
                                assResult = results[1];
                                completeResultWithZeroAnswers(assessment, assResult);
                                // convert into a new Result, otherwise we overwrite the old one
                                delete assResult.id;
                            } else {
                                // got no answers from server, need to generate default answers
                                assResult = assessment.getNewEmptyAssResult();
                            }

                            // return both, assessment and assResult in a simple object
                            return {
                                assessment: assessment,
                                result: assResult
                            };
                        });
                    },
                    putAnswer: function (answer) {
                        var assessment = Restangular.one('assessments', answer.assessment);
                        answer.id = answer.question;
                        _answerDirty = true;
                        return Restangular.restangularizeElement(assessment, answer, 'answers').put();
                    },
                    regenerateRecommendations: function() {
                        if (_answerDirty) {
                            _answerDirty = false;
                            return Restangular.all('coachRecommendations').getList();
                        } else {
                            var deferred = $q.defer();
                            deferred.resolve();
                            return deferred.promise;
                        }
                    },
                    getNewestAssessmentResults: function (topicId, options) {
                        return _topicId2Assessment(topicId)
                            .then(function (assessment) {
                                if (!UserService.principal.isAuthenticated()) {
                                    var deferred = $q.defer();
                                    deferred.resolve(assessment.getNewEmptyAssResult());
                                    return deferred.promise;
                                }

                                return Restangular
                                    .one('assessments', assessment.id)
                                    .one('results/newest')
                                    .get(options)
                                    .then(function (result) {
                                        if (!result) {
                                            result =  assessment.getNewEmptyAssResult();
                                        } else {
                                            completeResultWithZeroAnswers(assessment, result);
                                        }

                                        // sort answers into keyed object (by question_id) to ease access by view
                                        result.keyedAnswers = {};
                                        _.forEach(result.answers, function (myAnswer) {
                                            result.keyedAnswers[myAnswer.question] = myAnswer;
                                        });

                                        return result;
                                    });
                            });

                    },
                    topStressors: function (topicId) {
                        if (!UserService.principal.isAuthenticated()) {
                            var deferred = $q.defer();
                            deferred.resolve([]);
                            return deferred.promise;
                        }

                        return assService.getNewestAssessmentResults(topicId, {populatedeep: 'answers.question'}).then(function (result) {
                            if (!result || result.missingAnswers > 0) {
                                return null;
                            } else {

                                // allways include user stressors from profile
                                var focus = UserService.principal.getUser().profile.prefs.focus;
                                var threshold = 40;

                                var answers = _.filter(result.answers, function (answer) {
                                    return _.any(focus, function (focus) {
                                        return focus.question === answer.question.id;
                                    });
                                });

                                // first, filter out all answers lower than 40 and not already included from the user profile
                                var answersAboveThreshold = _.filter(result.answers, function (answer) {
                                    return Math.abs(answer.answer) > threshold && !_.any(focus, function (focus) {
                                        return focus.question === answer.question.id;
                                    });
                                });

                                var topAnswers = _.sortBy(answersAboveThreshold, function (answer) {
                                    return -Math.abs(answer.answer);
                                }).slice(0, 3);

                                return answers.concat(topAnswers);
                            }
                        });

                    },
                    isAnswerDirty: function() {
                        return _answerDirty;
                    }

                };

                return assService;
            }]);

}());