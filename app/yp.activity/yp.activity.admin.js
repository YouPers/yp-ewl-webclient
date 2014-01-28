(function () {
    'use strict';


    angular.module('yp.activity')

        .controller('ActivityAdminCtrl', ['$scope', '$rootScope',  'activity', 'assessment', 'ActivityService', 'activityFields', 'Restangular',
            function ($scope, $rootScope, activity, assessment, ActivityService, activityFields, Restangular) {

                if (!activity) {
                    activity = Restangular.restangularizeElement(null, {
                        number: 'NEW',
                        fields: [],
                        recWeights: [],
                        topics: ['workLifeBalance']
                    }, 'activities');
                }
                $scope.activity = activity;

                $scope.assessment = assessment;
                $scope.activityFields = activityFields;

                $scope.actFieldsModel = {};

                _.forEach(activityFields, function (fieldDesc, fieldId) {
                    $scope.actFieldsModel[fieldId] = (activity.fields.indexOf(fieldId) !== -1);
                });

                $scope.$watch('actFieldsModel', function (newValue, oldValue, scope) {
                    var newFields = [];
                    _.forEach(newValue, function (value, key) {
                        if (value) {
                            newFields.push(key);
                        }
                    });
                    activity.fields = newFields;
                }, true);

                if (!activity.qualityFactor) {
                    activity.qualityFactor = 1;
                }
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
                    if (activity.id) {
                        activity.put().then(function (result) {
                            ActivityService.reloadActivities().then(function () {
                                $rootScope.$broadcast('globalUserMsg', 'activity saved successfully', 'success', 5000);
                                $scope.$state.go('activitylist', $rootScope.$stateParams);
                            });
                        }, function (err) {
                            $rootScope.$broadcast('globalUserMsg', 'Error while saving Activity, Code: ' + err.status, 'danger', 5000);
                        });
                    } else {
                        activity.post().then(function (result) {
                            ActivityService.reloadActivities().then(function () {
                                $rootScope.$broadcast('globalUserMsg', 'activity saved successfully', 'success', 5000);
                                $scope.$state.go('activitylist', $rootScope.$stateParams);
                            });
                        }, function (err) {
                            $rootScope.$broadcast('globalUserMsg', 'Error while saving Activity, Code: ' + err.status, 'danger', 5000);
                        });
                    }
                };

                $scope.cancel = function () {
                    $scope.$state.go('activitylist');
                };
            }]);

}());
