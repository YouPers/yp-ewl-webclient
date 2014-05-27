(function () {
    'use strict';

    angular.module('yp.components.user')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
            function ($stateProvider, $urlRouterProvider, accessLevels) {
                $stateProvider
                    .state('profile', {
                        url: "/profile",
                        templateUrl: "components/user/profile/profile.html",
                        controller: "profileCtrl",
                        access: accessLevels.user,
                        resolve: { }
                    });

            }])

        .factory("ProfileService", ['$rootScope', 'Restangular', 'UserService',
            function ($rootScope, Rest, UserService) {
                return {

                    putProfile: function (profile) {
                        return Rest.restangularizeElement(null, profile, "profiles").put();
                    },
                    postAvatar: function (data) {
                        return Rest.one('users', UserService.principal.getUser().id).all("avatar").post({"data": data});
                    }

                };
            }])

        .controller('profileCtrl', ['$scope', '$rootScope', 'UserService', 'ProfileService', 'ActivityService',
            function ($scope, $rootScope, UserService, ProfileService, ActivityService) {

                $scope.profileUserObj = _.clone($scope.principal.getUser().profile, true);

                ActivityService.getActivities().then(function (acts) {
                    $scope.activities = acts;
                });

                $scope.reactivateActivity = function (recAct) {
                    // remove it from the clone we use to populate the form, so it immediately shows in the UI
                    _.remove($scope.profileUserObj.userPreferences.rejectedActivities, recAct);

                    // remove it from the real profile and immediatly save it, because it is not intuitiv to
                    // wait for the save button to be clicked in this case
                    _.remove($scope.principal.getUser().profile.userPreferences.rejectedActivities, recAct);
                    ProfileService.putProfile($scope.principal.getUser().profile);
                };

                $scope.saveProfile = function () {
                    ProfileService.putProfile($scope.profileUserObj).then(function (profile) {
                        $rootScope.$emit('clientmsg:success', 'profile.save');
                        $scope.principal.getUser().profile = profile;
                    });
                };


                var avatarMale = '/assets/img/avatar_man.png';
                var avatarFemale = '/assets/img/avatar_woman.png';

                $scope.defaultAvatar = function defaultAvatar(ev) {
                    var user = $scope.principal.getUser();
                    user.avatar = $scope.profileUserObj.gender === 'male' ? avatarMale : avatarFemale;
                    UserService.putUser(user).then(function(result) {
                        $scope.avatarObject = result;
                    });
                    if(ev) {
                        ev.stopPropagation();
                    }
                };

                $scope.isDefaultAvatar = function isDefaultAvatar() {
                    var user = $scope.avatarObject;
                    return user.avatar === avatarFemale ||user.avatar === avatarMale;
                };

                $scope.$watch('profileUserObj.gender', function(gender, old) {

                    var user = $scope.principal.getUser();

                    if (!user.avatar ||
                        user.avatar === avatarFemale ||
                        user.avatar === avatarMale
                        ) {

                        $scope.defaultAvatar();
                    }
                });

                $scope.avatarObject = $scope.principal.getUser();

            }]);


}());