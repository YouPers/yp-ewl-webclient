(function () {
    'use strict';


    angular.module('yp.dhc')

        .directive('activityEdit', ['$rootScope', '$modal', 'ActivityService', 'CampaignService', 'UserService',
            function ($rootScope, $modal, ActivityService, CampaignService, UserService) {
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
                                !activity.description || activity.description === "") {
                                return true;
                            }
                        };

                        $scope.isProductAdmin = function() {
                            return (UserService.principal.getUser().roles.indexOf('productadmin') !== -1);
                        };

                        $scope.save = function() {
                            // reset the currentCampaign to the activity, the user might have changed it
                            if (CampaignService.currentCampaign) {
                                $scope.activity.campaign = CampaignService.currentCampaign;
                            }
                            ActivityService.saveActivity($scope.activity).then(function (result) {

                                $scope.activity.id = result.id;

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


                        $scope.selectActivityImage = function selectActivityImage() {

                            var modalInstance = $modal.open({
                                templateUrl: 'components/activity-edit-directive/activity-image-modal.html',
                                controller: 'ActivityImageModalController',
                                resolve: {

                                },
                                windowClass: 'activity-image-modal'
                            });

                            return modalInstance.result.then(function (selection) {
                                $scope.activity.number = selection;
                            }, function () {
                                // do nothing on dialog dismiss()
                            });

                        };
                    }
                };
            }])


        .controller('ActivityImageModalController', ['$scope', '$modalInstance',
            function ($scope, $modalInstance) {

                var prefix = '/assets/actpics/';
                $scope.list = [];

                for(var i=0;i<12;i++) {

                    var id = 'Act-' + (100 + i);

                    $scope.list.push({
                        id: id,
                        path: prefix + id + '.jpg'
                    });
                }

                $scope.select = function (selection) {
                    $modalInstance.close(selection);
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }]);


})();