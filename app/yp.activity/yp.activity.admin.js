(function () {
    'use strict';


    angular.module('yp.activity')

        .controller('ActivityAdminCtrl', ['$scope', '$rootScope', 'activity', 'assessment', 'ActivityService', 'Restangular',
            function ($scope, $rootScope, activity, assessment, ActivityService, Restangular) {

                if (!activity) {
                    activity = Restangular.restangularizeElement(null, {
                        number: 'NEW',
                        source: "youpers",
                        defaultfrequency: "once",
                        "defaultexecutiontype": "self",
                        "defaultvisibility": "private",
                        "defaultduration": 60,
                        fields: [],
                        recWeights: [],
                        topics: ['workLifeBalance']
                    }, 'activities');
                }
                $scope.activity = activity;
                $scope.assessment = assessment;

                $scope.offer = {
                    activity: activity,
                    recommendedBy: {}
                };

                // Weighting to generate recommendation of activity based on answers of this assessment
                // initialize weights if they do not yet exist
                if (!activity.recWeights || activity.recWeights.length === 0) {
                    activity.recWeights = [];
                }

                // backend does not store emtpy weights, but our UI needs an empty record for each question
                // so we add one for all question that don't have one

                _.forEach(assessment.questions, function (question) {
                    if (!_.any(activity.recWeights, function (recWeight) {
                        return recWeight[0] === question.id;
                    })) {
                        activity.recWeights.push([question.id, 0, 0]);
                    }
                });


                $scope.recWeights = activity.getRecWeightsByQuestionId();

                $scope.onSave = function () {
                    $scope.$state.go('activitylist', $rootScope.$stateParams);
                    $rootScope.$emit('clientmsg:success', 'activity.save');
                };

                $scope.onCancel = function () {
                    $scope.$state.go('activitylist');
                };
            }]);

}());
