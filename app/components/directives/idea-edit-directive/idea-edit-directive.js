(function () {
    'use strict';


    angular.module('yp.components.ideaEdit', [])

        .directive('ideaEdit', ['$rootScope', '$modal', 'ActivityService', 'CampaignService', 'UserService',
            function ($rootScope, $modal, ActivityService, CampaignService, UserService) {
                return {

                    restrict: 'EA',
                    templateUrl: 'components/directives/idea-edit-directive/idea-edit-directive.html',

                    scope: {
                        idea: "=",
                        onSave: "&",
                        onCancel: "&"
                    },

                    link: function ($scope, elem, attrs) {

                        $scope.enums = $rootScope.enums;

                        var idea = $scope.idea;
                        $scope.actFieldsModel = {};

                        _.forEach(idea.fields, function (fieldId) {
                            $scope.actFieldsModel[fieldId] = true;
                        });

                        $scope.$watch('actFieldsModel', function (newValue, oldValue, scope) {
                            var newFields = [];
                            _.forEach(newValue, function (value, key) {
                                if (value) {
                                    newFields.push(key);
                                }
                            });
                            idea.fields = newFields;
                        }, true);

                        if (!idea.qualityFactor) {
                            idea.qualityFactor = 1;
                        }

                        $scope.validate = function () {
                            if (!idea.title || idea.title === "" ||
                                !idea.description || idea.description === "") {
                                return true;
                            }
                        };

                        $scope.isProductAdmin = function() {
                            return (UserService.principal.getUser().roles.indexOf('productadmin') !== -1);
                        };

                        $scope.save = function() {
                            // reset the currentCampaign to the idea, the user might have changed it
                            if (CampaignService.currentCampaign) {
                                $scope.idea.campaign = CampaignService.currentCampaign;
                            }
                            ActivityService.saveIdea($scope.idea).then(function (result) {

                                $scope.idea.id = result.id;

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


                        $scope.selectIdeaImage = function selectIdeaImage() {

                            var modalInstance = $modal.open({
                                templateUrl: 'components/directives/idea-edit-directive/idea-image-modal.html',
                                controller: 'IdeaImageModalController',
                                resolve: {

                                },
                                windowClass: 'activity-image-modal'
                            });

                            return modalInstance.result.then(function (selection) {
                                $scope.idea.number = selection;
                            }, function () {
                                // do nothing on dialog dismiss()
                            });

                        };
                    }
                };
            }])


        .controller('IdeaImageModalController', ['$scope', '$modalInstance',
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