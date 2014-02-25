(function () {
    'use strict';


    angular.module('yp.activity')

        .directive('activityEdit', ['$rootScope',
            function ($rootScope) {
                return {

                    restrict: 'EA',
                    templateUrl: 'yp.activity/yp.activity.edit.html',


                    link: function ($scope, elem, attrs) {


                        var activity = $scope.activity;
                        $scope.actFieldsModel = {};

                        _.forEach(activity.fields, function (fieldId) {
                            $scope.actFieldsModel[fieldId] = true;
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

                    }
                };
            }])

        .controller('ActivityEditCtrl', ['$scope', '$rootScope',  'activity', 'ActivityService', 'Restangular',
            function ($scope, $rootScope, activity, ActivityService, Restangular) {

                if (!activity) {
                    activity = Restangular.restangularizeElement(null, {
                        number: 'NEW',
                        fields: [],
                        recWeights: [],
                        topics: ['workLifeBalance']
                    }, 'activities');
                }
                $scope.activity = activity;

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


})();