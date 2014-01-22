(function () {
    'use strict';

    angular.module('yp.user.profile', ['ui.router', 'yp.auth', 'ypconfig', 'restangular', 'angularFileUpload'])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
            function ($stateProvider, $urlRouterProvider, accessLevels) {
                $stateProvider
                    .state('profile', {
                        url: "/profile",
                        templateUrl: "yp.user/user.profile.html",
                        controller: "UserProfileCtrl",
                        access: accessLevels.individual,
                        resolve: { }
                    });

            }])

        .factory("yp.user.UserProfileService", ['$rootScope', 'Restangular', 'principal',
            function ($rootScope, Rest, principal) {
                var UserProfileService = {

                    putUserProfile: function (userProfile) {
                        return Rest.restangularizeElement(null, userProfile, "profiles").put();
                    },
                    postAvatar: function(data) {
                        return Rest.one('users', principal.getUser().id).all("avatar").post({"data":data}, {}, {
                                'Content-Type': ''
                            }
                        );
                    }

                };
                return UserProfileService;
            }])

        .controller('UserProfileCtrl', ['$scope', '$rootScope', 'yp.user.UserProfileService',
            function ($scope, $rootScope, UserProfileService) {

                $scope.profileUserObj = _.clone($scope.principal.getUser().profile);

                $scope.saveProfile = function () {
                    UserProfileService.putUserProfile($scope.profileUserObj).then(function (profile) {
                        $rootScope.$broadcast('globalUserMsg', 'Your user profile has been saved', 'success', 3000);
                        $scope.principal.getUser().profile = profile;
                    }, function (error) {
                        $rootScope.$broadcast('globalUserMsg', 'Error while saving: ' + error, 'danger', 3000);
                    });

                };

            }])

        .controller('AvatarUploadCtrl', ['$scope', '$http', 'yp.user.UserProfileService', '$fileUploader', 'ypconfig',
            function($scope, $http, UserProfileService, $fileUploader, ypconfig) {

                var user = $scope.principal.getUser();
                var url = ypconfig.backendUrl + "/users/" + user.id + "/avatar";

                var uploader = $scope.uploader = $fileUploader.create({
                    scope: $scope,
                    url: url,
                    autoUpload: true,
                    headers: {
                        'Authorization': $http.defaults.headers.common.Authorization
                    }
                });


                // ADDING FILTERS

                // Images only
                uploader.filters.push(function(item /*{File|HTMLInputElement}*/) {
                    var type = uploader.isHTML5 ? item.type : '/' + item.value.slice(item.value.lastIndexOf('.') + 1);
                    type = '|' + type.toLowerCase().slice(type.lastIndexOf('/') + 1) + '|';
                    return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
                });




            }])
        .directive('avatar', function() {
            return function(scope, element, attrs) {
                var image = scope.principal.getUser().profile.avatarImage;
                element[0].src = image;
            };
        });

}());