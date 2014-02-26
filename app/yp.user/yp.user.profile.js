(function () {
    'use strict';

    angular.module('yp.user')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
            function ($stateProvider, $urlRouterProvider, accessLevels) {
                $stateProvider
                    .state('profile', {
                        url: "/profile",
                        templateUrl: "yp.user/yp.user.profile.html",
                        controller: "profileCtrl",
                        access: accessLevels.user,
                        resolve: { }
                    });

            }])

        .factory("ProfileService", ['$rootScope', 'Restangular', 'UserService',
            function ($rootScope, Rest, UserService) {
                var ProfileService = {

                    putProfile: function (profile) {
                        return Rest.restangularizeElement(null, profile, "profiles").put();
                    },
                    postAvatar: function(data) {
                        return Rest.one('users', UserService.principal.getUser().id).all("avatar").post({"data":data});
                    }

                };
                return ProfileService;
            }])

        .controller('profileCtrl', ['$scope', '$rootScope', 'ProfileService',
            function ($scope, $rootScope, ProfileService) {

                $scope.profileUserObj = _.clone($scope.principal.getUser().profile);

                $scope.saveProfile = function () {
                    ProfileService.putProfile($scope.profileUserObj).then(function (profile) {
                        $rootScope.$broadcast('globalUserMsg', 'Your user profile has been saved', 'success', 3000);
                        $scope.principal.getUser().profile = profile;
                    }, function (error) {
                        $rootScope.$broadcast('globalUserMsg', 'Error while saving: ' + error, 'danger', 3000);
                    });

                };

                $scope.avatarObject = $scope.principal.getUser();

            }]);


}());