'use strict';

angular.module('i18n', ['pascalprecht.translate'])

    .controller('i18nCtrl', ['$scope', '$translate','$http', '$rootScope', 'UserProfileService',
        function ($scope, $translate, $http, $rootScope, UserProfileService) {

        $scope.currentLang = $translate.uses();

        $scope.changeLang = function (key) {
            moment.lang(key);
            $http.defaults.headers.common['yp-language'] =  key;
            $translate.uses(key).then(function (key) {
                $translate.refresh();
                $scope.$state.go('bounce', {state: $scope.$state.current.name, params: JSON.stringify($scope.$stateParams)});
                $rootScope.currentLocale = $translate.uses() || $translate.proposedLanguage();
                var profile = $scope.principal.getUser().profile;
                profile.language = key;
                UserProfileService.putUserProfile(profile).then(function success() {
                    console.log('successfully updated user profile');
                }, function error(err) {
                    console.log(err);
                });
            }, function (key) {
            });
        };

    }
    ]);
