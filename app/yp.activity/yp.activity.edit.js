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
            }]);
})();