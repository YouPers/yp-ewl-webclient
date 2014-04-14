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

                        $scope.validate = function () {
                            if (!activity.title || activity.title === "" ||
                                !activity.text || activity.text === "") {
                                return true;
                            }
                        };

                    }
                };
            }])

        .controller('ActivityEditCtrl', ['$scope', '$rootScope',  'activity', 'ActivityService', 'activityType',
            function ($scope, $rootScope, activity, ActivityService, activityType) {

                $scope.activity = activity;

                $scope.activityType = activityType;

                $scope.save = function () {

                    ActivityService.saveActivity(activity).then(function(result) {
                        $rootScope.$emit('clientmsg:success', 'activity.save');
                        if ($scope.activityType === "campaign") {
                            $scope.$state.go('campaign', {id: $scope.activity.campaign});
                        } else  {
                            $scope.$state.go('activitylist', $rootScope.$stateParams);
                        }
                    });
                };

                $scope.cancel = function () {
                    if ($scope.activityType === "campaign") {
                        $scope.$state.go('campaign', {id: $scope.activity.campaign});
                    } else  {
                        $scope.$state.go('activitylist');
                    }
                };
            }]);


})();