(function () {
    'use strict';


    angular.module('yp.dhc')

        .directive('activityEdit', ['$rootScope', 'ActivityService', 'CampaignService',
            function ($rootScope, ActivityService, CampaignService) {
                return {

                    restrict: 'EA',
                    templateUrl: 'components/activity-edit-directive/activity-edit-directive.html',

                    scope: {
                        activity: "=",
                        onSave: "&",
                        onCancel: "&"
                    },

                    link: function ($scope, elem, attrs) {

                        $scope.enums = $rootScope.enums;

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

                        $scope.save = function() {
                            // reset the currentCampaign to the activity, the user might have changed it
                            if (CampaignService.currentCampaign) {
                                $scope.activity.campaign = CampaignService.currentCampaign;
                            }
                            ActivityService.saveActivity($scope.activity).then(function (result) {

                                if(attrs.onSave) {
                                    $scope.onSave(result);
                                }

                            });
                        };

                        $scope.cancel = function() {
                            if(attrs.onCancel) {
                                $scope.onCancel();
                            }
                        };

                    }
                };
            }]);


})();