(function () {
    'use strict';


    angular.module('yp.activity')

        .controller('ActivityAdminCtrl', ['$scope', '$rootScope',  'activity', 'assessment', 'ActivityService', 'Restangular',
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


                // Weihting to generate recommendation of activity based on answers of this assessment
                // initialize weights if they do not yet exist
                if (!activity.recWeights || activity.recWeights.length === 0) {
                    activity.recWeights = [];
                    _.forEach(assessment.questionCats, function (cat) {
                        _.forEach(cat.questions, function (question) {
                            activity.recWeights.push({question: question.id, negativeAnswerWeight: 0, positiveAnswerWeight: 0});
                        });
                    });
                }

                $scope.recWeights = activity.getRecWeightsByQuestionId();

                $scope.save = function () {

                    var saveSuccess = function(result) {
                        $rootScope.$broadcast('globalUserMsg', 'activity saved successfully', 'success', 5000);
                        $scope.$state.go('activitylist', $rootScope.$stateParams);
                    };
                    var saveError = function(err) {
                        $rootScope.$broadcast('globalUserMsg', 'Error while saving Activity, Code: ' + err.status, 'danger', 5000);
                    };

                    ActivityService.saveActivity(activity, saveSuccess, saveError);
                };

                $scope.cancel = function () {
                    $scope.$state.go('activitylist');
                };
            }]);

}());
