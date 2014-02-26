(function () {
    'use strict';

    angular.module('yp.user')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
            function ($stateProvider, $urlRouterProvider, accessLevels) {
                $stateProvider
                    .state('profile', {
                        url: "/profile",
                        templateUrl: "yp.user/yp.user.profile.html",
                        controller: "UserProfileCtrl",
                        access: accessLevels.user,
                        resolve: { }
                    });

            }])

        .factory("UserProfileService", ['$rootScope', 'Restangular', 'UserService',
            function ($rootScope, Rest, UserService) {
                var UserProfileService = {

                    putUserProfile: function (userProfile) {
                        return Rest.restangularizeElement(null, userProfile, "profiles").put();
                    },
                    postAvatar: function(data) {
                        return Rest.one('users', UserService.principal.getUser().id).all("avatar").post({"data":data});
                    }

                };
                return UserProfileService;
            }])

        .controller('UserProfileCtrl', ['$scope', '$rootScope', 'UserProfileService',
            function ($scope, $rootScope, UserProfileService) {

                $scope.profileUserObj = _.clone($scope.principal.getUser().profile);

                $scope.saveProfile = function () {
                    UserProfileService.putUserProfile($scope.profileUserObj).then(function (profile) {
                        $rootScope.$emit('notification:success', 'profile.save');
                        $scope.principal.getUser().profile = profile;
                    }, function (err) {
                        $rootScope.$emit('notification:error', err);
                    });
                };

                $scope.avatarObject = $scope.principal.getUser();

            }]);


}());