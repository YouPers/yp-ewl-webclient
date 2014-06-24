(function () {
    'use strict';


    angular.module('yp.admin')

        .controller('IdeaAdminCtrl', ['$scope', '$rootScope', 'idea', 'assessment', 'ActivityService', 'Restangular',
            function ($scope, $rootScope, idea, assessment, ActivityService, Restangular) {

                if (!idea) {
                    idea = Restangular.restangularizeElement(null, {
                        number: 'NEW',
                        source: "youpers",
                        defaultfrequency: "once",
                        "defaultexecutiontype": "self",
                        "defaultvisibility": "private",
                        "defaultduration": 60,
                        fields: [],
                        recWeights: [],
                        topics: ['workLifeBalance']
                    }, 'ideas');
                }
                $scope.idea = idea;
                $scope.assessment = assessment;

                $scope.offer = {
                    idea: idea,
                    recommendedBy: {}
                };

                // Weighting to generate recommendation of idea based on answers of this assessment
                // initialize weights if they do not yet exist
                if (!idea.recWeights || idea.recWeights.length === 0) {
                    idea.recWeights = [];
                }

                // backend does not store emtpy weights, but our UI needs an empty record for each question
                // so we add one for all question that don't have one

                _.forEach(assessment.questions, function (question) {
                    if (!_.any(idea.recWeights, function (recWeight) {
                        return recWeight[0] === question.id;
                    })) {
                        idea.recWeights.push([question.id, 0, 0]);
                    }
                });


                $scope.recWeights = idea.getRecWeightsByQuestionId();

                $scope.onSave = function () {
                    $scope.$state.go('admin-idea.list', $rootScope.$stateParams);
                    $rootScope.$emit('clientmsg:success', 'idea.save');
                };

                $scope.onCancel = function () {
                    $scope.$state.go('admin-idea.list');
                };
            }]);

}());
