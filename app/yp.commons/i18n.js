'use strict';

angular.module('i18n', ['pascalprecht.translate'])

    .controller('i18nCtrl', ['$scope', '$translate', '$http', '$rootScope', 'ProfileService',
        function ($scope, $translate, $http, $rootScope, ProfileService) {

            $scope.currentLang = $translate.use();

            $scope.changeLang = function (key) {
                moment.lang(key);
                $http.defaults.headers.common['yp-language'] = key;
                $translate.use(key).then(function (key) {
                    $translate.refresh();
                    $scope.$state.go('bounce', {state: $scope.$state.current.name, params: JSON.stringify($scope.$stateParams)});
                    $rootScope.currentLocale = $translate.use() || $translate.proposedLanguage();
                    var profile = $scope.principal.getUser().profile;
                    profile.language = key;
                    ProfileService.putProfile(profile).then(function success() {
                        console.log('successfully updated user profile');
                    });
                }, function (err) {
                    console.log('could not switch language, err: ' + err);
                });
            };

        }
    ]);
