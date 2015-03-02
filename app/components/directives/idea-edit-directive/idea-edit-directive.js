(function () {
    'use strict';


    angular.module('yp.components.ideaEdit', [])

        .directive('ideaEdit', ['$rootScope', '$modal', 'ActivityService', 'CampaignService', 'UserService', 'ImageService',
            function ($rootScope, $modal, ActivityService, CampaignService, UserService, ImageService) {
                return {

                    restrict: 'EA',
                    templateUrl: 'components/directives/idea-edit-directive/idea-edit-directive.html',
                    transclude: true,
                    scope: {
                        idea: "=",
                        topics: "=",
                        onSave: "=",
                        onCancel: "="
                    },

                    link: function ($scope, elem, attrs) {

                        $scope.enums = $rootScope.enums;

                        var idea = $scope.idea;
                        $scope.topicsModel = {};

                        _.forEach(idea.topics, function(topic) {
                              $scope.topicsModel[topic] = true;
                        });

                        $scope.$watch('topicsModel', function (newValue, oldValue, scope) {
                            var newTopics = [];
                            _.forEach(newValue, function (value, key) {
                                if (value) {
                                    newTopics.push(key);
                                }
                            });
                            idea.topics = newTopics;
                        }, true);

                        if (!idea.qualityFactor) {
                            idea.qualityFactor = 1;
                        }

                        $scope.isProductAdmin = function() {
                            return (UserService.principal.getUser().roles.indexOf('productadmin') !== -1);
                        };

                        $scope.save = function() {
                            if ($scope.idea.noDefaultStartTime) {
                                $scope.idea.defaultStartTime = "";
                            } else {
                                // noDefaultStartTime is not selected, check whether a real date is in idea.defaultStartTime,
                                // if not: set to current date
                                // -> prevents the empty idea.defaultStartTime, when the
                                // timepicker is not manually touched by the user
                                if (!$scope.idea.defaultStartTime) {
                                    $scope.idea.defaultStartTime = new Date();
                                }
                            }

                            // reset the currentCampaign to the idea, the user might have changed it
                            if (CampaignService.currentCampaign) {
                                $scope.idea.campaign = CampaignService.currentCampaign;
                            }
                            ActivityService.saveIdea($scope.idea).then(function (result) {
                                // reinitialize the UI flag for noDefaultStartTime
                                result.noDefaultStartTime = !idea.defaultStartTime;
                                $scope.idea = result;

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
                                windowClass: 'idea-image-modal'
                            });

                            return modalInstance.result.then(function (selection) {
                                $scope.idea.picture = selection.path;
                            }, function () {
                                // do nothing on dialog dismiss()
                            });

                        };

                        $scope.uploader = ImageService.getImageUploader('idea', $scope, function successCb (url) {
                            $rootScope.$log.log('image upload success');
                            $scope.idea.picture = url;
                        });

                    }
                };
            }])


        .controller('IdeaImageModalController', ['$scope', '$modalInstance',
            function ($scope, $modalInstance) {

                var prefix = 'https://dxjlk9p2h4a7j.cloudfront.net/ideas/';
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