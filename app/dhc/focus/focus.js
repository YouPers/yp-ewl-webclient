(function () {
    'use strict';

    angular.module('yp.dhc')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('dhc.focus', {
                        url: "/focus",
                        access: accessLevels.user,
                        views: {
                            content: {
                                templateUrl: 'dhc/focus/focus.html',
                                controller: 'FocusController as focusController'
                            }
                        },
                        resolve: {
                            assessmentResult: ['AssessmentService','UserService', '$q', function(AssessmentService, UserService, $q) {
                                var currentUsersCampaign = UserService.principal.getUser().campaign;
                                if (!currentUsersCampaign) {
                                    return $q.reject('User is not part of a camapaign, Assessment only possible when user is part of a camapgin');
                                }
                                return AssessmentService.getNewestAssessmentResults(currentUsersCampaign.topic.id || currentUsersCampaign.topic);
                            }],
                            assessment: ['AssessmentService','UserService', '$q', function (AssessmentService, UserService, $q) {
                                var currentUsersCampaign = UserService.principal.getUser().campaign;
                                if (!currentUsersCampaign) {
                                    return $q.reject('User is not part of a camapaign, Assessment only possible when user is part of a camapgin');
                                }
                                return AssessmentService.getAssessment(currentUsersCampaign.topic.id || currentUsersCampaign.topic);
                            }],
                            assessmentIdea: ['ActivityService', 'assessment', function (ActivityService, assessment) {
                                return ActivityService.getIdea(assessment.idea.id || assessment.idea);
                            }]

                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/focus/focus');
            }])

        .controller('FocusController', [ '$scope',
            'ProfileService', 'AssessmentService',
            'assessmentResult', 'assessment', 'assessmentIdea',
            function ($scope,
                      ProfileService, AssessmentService,
                      assessmentResult, assessment, assessmentIdea) {

                $scope.needForAction = assessmentResult? assessmentResult.needForAction : null;

                $scope.categories = _.map(assessmentResult.needForAction, 'category');

                $scope.topStressors = topStressors;
                $scope.assessmentIdea = assessmentIdea;

                var profile = $scope.principal.getUser().profile;

                $scope.prefs = profile.prefs;

                if (profile.prefs.focus && profile.prefs.focus.length > 0) {
                    _.forEach(profile.prefs.focus, function(foc) {
                        var selectedStressor = null;
                        selectedStressor = _.find(topStressors, function(stressor) {
                            return stressor.question.id === foc.question;
                        });
                        if (selectedStressor) {
                            selectedStressor.selected = true;
                        }
                    });
                }

                $scope.stressorSelected = function(stressor) {
                    var id  = stressor.question.id;

                    var focus = profile.prefs.focus;

                    if (stressor.selected) {
                        if (!_.contains(focus, id)) {
                            focus.push({question: id, timestamp: new Date()});
                        }
                    } else {
                        _.remove(focus, function(foc) {
                            return foc.question === id;
                        });
                    }

                    ProfileService.putProfile($scope.principal.getUser().profile);
                };

                $scope.savePersonalGoal = function() {
                    ProfileService.putProfile($scope.principal.getUser().profile);
                };

                function _getNeedForCategory (category) {
                    var nfa = _.find($scope.needForAction, function(nfa) {
                        return nfa.category === category;
                    });

                    return  nfa ? nfa.value : 0;
                }

                $scope.needForActionClass = function(category) {


                   var need = _getNeedForCategory(category);

                    var level = !need || need < 1 ? "none" :
                        need < 4 ? "low" :
                            need < 7 ? "medium" : "high";

                    var obj  = {};
                    obj[level] = true;
                    return obj;

                };

                $scope.needForActionStyle = function(category) {
                    return {
                        width: _getNeedForCategory(category) * 10 * 0.6 + '%'
                    };
                };

            }
        ]);

}());