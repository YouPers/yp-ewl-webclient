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

        .factory("UserProfileService", ['$rootScope', 'Restangular', 'principal',
            function ($rootScope, Rest, principal) {
                var UserProfileService = {

                    putUserProfile: function (userProfile) {
                        return Rest.restangularizeElement(null, userProfile, "profiles").put();
                    },
                    postAvatar: function(data) {
                        return Rest.one('users', principal.getUser().id).all("avatar").post({"data":data});
                    }

                };
                return UserProfileService;
            }])

        .controller('UserProfileCtrl', ['$scope', '$rootScope', 'UserProfileService',
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

                $scope.avatarObject = $scope.principal.getUser();

            }]);


}());