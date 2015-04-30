(function () {
    'use strict';


    angular.module('yp.components.ideaEdit', [])

        .directive('ideaEdit', ['$rootScope', '$modal', 'ActivityService', 'CampaignService', 'UserService', 'ImageService',
            function ($rootScope, $modal, ActivityService, CampaignService, UserService, ImageService) {
                return {

                    restrict: 'EA',
                    templateUrl: 'components/idea/idea-edit-directive/idea-edit-directive.html',
                    transclude: true,
                    scope: {
                        idea: "=",
                        topics: "=",
                        ideaForm: "="
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


                        $scope.selectIdeaImage = function selectIdeaImage() {
                            var modalInstance = $modal.open({
                                templateUrl: 'components/idea/idea-edit-directive/idea-image-modal.html',
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

                var prefix = 'https://dxjlk9p2h4a7j.cloudfront.net/customideadefaultpics/';
                $scope.list = [];

                var pics = ("Fotolia_23380966_XS.jpg Fotolia_61363991_XS.jpg Fotolia_64195461_XS.jpg " +
                    "Fotolia_71239295_XS.jpg Fotolia_73498966_XS.jpg Fotolia_81123380_XS.jpg "+
                    "Fotolia_50572236_XS.jpg Fotolia_62968358_XS.jpg Fotolia_66960425_XS.jpg " +
                    "Fotolia_72329892_XS.jpg Fotolia_80763519_XS.jpg Fotolia_82092559_XS.jpg").split(' ');

                for(var i=0;i<12;i++) {

                    var id = 'Cust-' + (100 + i);

                    $scope.list.push({
                        id: id,
                        path: prefix + pics[i]
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