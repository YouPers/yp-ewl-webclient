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
                    postAvatar: function (data) {
                        return Rest.one('users', UserService.principal.getUser().id).all("avatar").post({"data": data});
                    }

                };
                return ProfileService;
            }])

        .controller('profileCtrl', ['$scope', '$rootScope', 'ProfileService', 'ActivityService',
            function ($scope, $rootScope, ProfileService, ActivityService) {

                $scope.profileUserObj = _.clone($scope.principal.getUser().profile);

                ActivityService.getActivities().then(function (acts) {
                    $scope.activities = acts;
                });

                $scope.reactivateActivity = function (recAct) {
                    _.remove($scope.profileUserObj.userPreferences.rejectedActivities, recAct);
                    _.remove($scope.principal.getUser().profile.userPreferences.rejectedActivities, recAct);
                    ProfileService.putProfile($scope.principal.getUser().profile);
                };

                $scope.saveProfile = function () {
                    ProfileService.putProfile($scope.profileUserObj).then(function (profile) {
                        $rootScope.$emit('notification:success', 'profile.save');
                        $scope.principal.getUser().profile = profile;
                    });
                };

                $scope.avatarObject = $scope.principal.getUser();

            }]);


}());