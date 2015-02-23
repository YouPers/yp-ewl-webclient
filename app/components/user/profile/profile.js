(function () {
    'use strict';

    angular.module('yp.components.user')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
            function ($stateProvider, $urlRouterProvider, accessLevels) {
                $stateProvider
                    .state('profile', {
                        url: "/profile?settings",
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

        .controller('profileCtrl', ['$scope', '$rootScope', '$state', '$stateParams', '$translate', 'UserService', 'ProfileService', 'ActivityService',
            function ($scope, $rootScope, $state, $stateParams, $translate, UserService, ProfileService, ActivityService) {

                $scope.profileUserObj = _.clone($scope.principal.getUser().profile, true);

                $scope.isOpen = {
                    'profile': !$stateParams.settings,
                    'settings': !!$stateParams.settings
                };

                $scope.workdays = {};
                 _.forEach($rootScope.enums.weekday, function(day) {
                    $scope.workdays[day] = _.contains($scope.profileUserObj.prefs.defaultWorkWeek, day);
                });

                $scope.changedWorkDay = function(weekday) {
                    if ($scope.workdays[weekday] && !_.contains($scope.profileUserObj.prefs.defaultWorkWeek, weekday)) {
                        $scope.profileUserObj.prefs.defaultWorkWeek.push(weekday);
                    } else {
                        _.remove($scope.profileUserObj.prefs.defaultWorkWeek, function(d) {
                            return d === weekday;
                        });
                    }
                };

                $scope.saveProfile = function () {
                    ProfileService.putProfile($scope.profileUserObj).then(function (profile) {
                        $rootScope.$emit('clientmsg:success', 'profile.save');
                        $scope.principal.getUser().profile = profile;
                        if(profile.language) {
                            $scope.$root.$broadcast('language:changed', profile.language);
                        }
                    });
                };


                var avatarMale = '/assets/img/default_avatar_man.png';
                var avatarFemale = '/assets/img/default_avatar_woman.png';

                $scope.defaultAvatar = function defaultAvatar(ev) {
                    var user = $scope.principal.getUser();
                    user.avatar = $scope.profileUserObj.gender === 'male' ? avatarMale : avatarFemale;
                    UserService.putUser(user).then(function(result) {
                        _.extend($scope.avatarObject, result);
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