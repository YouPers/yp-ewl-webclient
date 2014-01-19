(function () {
    'use strict';

    angular.module('yp.user.profile', ['ui.router', 'yp.auth', 'restangular'])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
            function ($stateProvider, $urlRouterProvider, accessLevels) {
                $stateProvider
                    .state('profile', {
                        url: "/profile",
                        templateUrl: "partials/user.profile.html",
                        controller: "UserProfileCtrl",
                        access: accessLevels.individual,
                        resolve: { }
                    });

            }])

        .factory("yp.user.UserProfileService", ['$rootScope', 'Restangular', 'principal',
            function ($rootScope, Rest, principal) {
                var UserProfileService = {

                    getUserProfile: function () {
                        if (principal.isAuthenticated()) {
                            return Rest.one('profiles').get();
                        }
                        //ToDo else case needed?
                    },

                    putUserProfile: function (userProfile) {
                        return Rest.restangularizeElement(null, userProfile, "profiles").put();
                    }

                };
                return UserProfileService;
            }])


        .controller('UserProfileCtrl', ['$scope', '$rootScope', 'principal', 'yp.user.UserProfileService',
            function ($scope, $rootScope, principal, UserProfileService) {

                UserProfileService.getUserProfile().then(function (result) {
                    // result delivers an array with one element, thus store this single array element
                    $scope.profileUserObj = result[0];
                });

                $scope.saveProfile = function () {
                    UserProfileService.putUserProfile($scope.profileUserObj).then(function (profile) {
                        $rootScope.$broadcast('globalUserMsg', 'Your user profile has been saved', 'success', 3000);
                    });

                };

            }]);

}());