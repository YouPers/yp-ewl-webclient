(function () {
    'use strict';

    angular.module('yp.dhc')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('focus', {
                        templateUrl: "layout/default.html",
                        access: accessLevels.user
                    })
                    .state('focus.content', {
                        url: "/focus",
                        access: accessLevels.user,
                        views: {
                            content: {
                                templateUrl: 'dhc/focus/focus.html',
                                controller: 'FocusController'
                            }
                        },
                        resolve: {
                            assessmentResult: ['AssessmentService','UserService', '$q', function(AssessmentService, UserService, $q) {
                                var currentUsersCampaign = UserService.principal.getUser().campaign;
                                if (!currentUsersCampaign) {
                                    return $q.reject('User is not part of a camapaign, Assessment only possible when user is part of a camapgin');
                                }
                                return AssessmentService.getNewestAssessmentResults(currentUsersCampaign.topic);
                            }],
                            topStressors: ['AssessmentService','UserService', '$q', function (AssessmentService, UserService, $q) {
                                var currentUsersCampaign = UserService.principal.getUser().campaign;
                                if (!currentUsersCampaign) {
                                    return $q.reject('User is not part of a camapaign, Assessment only possible when user is part of a camapgin');
                                }
                                return AssessmentService.topStressors(currentUsersCampaign.topic);
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/focus/focus');
            }])

        .controller('FocusController', [ '$scope', 'assessmentResult', 'topStressors', 'ProfileService', 'AssessmentService',
            function ($scope, assessmentResult, topStressors,  ProfileService, AssessmentService) {

                $scope.needForAction = assessmentResult? assessmentResult.needForAction : null;

                $scope.categories = [
                    'work',
                    'leisure',
                    'stresstypus',
                    'handling'
                ];

                $scope.topStressors = topStressors;


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

                $scope.needForActionClass = function(category) {


                    var need = $scope.needForAction[category];

                    var level = !need || need < 1 ? "none" :
                        need < 4 ? "low" :
                            need < 7 ? "medium" : "high";

                    var obj  = {};
                    obj[level] = true;
                    return obj;

                };

                $scope.needForActionStyle = function(category) {
                    return {
                        width: $scope.needForAction[category] * 10 * 0.6 + '%'
                    };
                };

            }
        ]);

}());