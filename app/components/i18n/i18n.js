'use strict';

angular.module('yp.components.i18n', ['pascalprecht.translate', 'yp.components.user', 'tmh.dynamicLocale'])
    .config(['tmhDynamicLocaleProvider', function(tmhDynamicLocaleProvider) {
        tmhDynamicLocaleProvider.localeLocationPattern('lib/angular-i18n/angular-locale_{{locale}}.js');
    }])
    .controller('i18nCtrl', ['$scope', '$translate', '$http', '$rootScope', 'ProfileService', 'tmhDynamicLocale',
        function ($scope, $translate, $http, $rootScope, ProfileService, tmhDynamicLocale) {

            $scope.currentLang = $translate.use();
            $scope.changeLang = function (key) {
                tmhDynamicLocale.set(key);
                moment.locale(key);
                $scope.currentLang = key;
                $http.defaults.headers.common['yp-language'] = key;
                $translate.use(key).then(function (key) {
                    $translate.refresh();
                    $scope.$state.go('bounce', {state: $scope.$state.current.name, params: JSON.stringify($scope.$stateParams)});
                    $rootScope.currentLocale = $translate.use() || $translate.proposedLanguage();
                    var profile = $scope.principal.getUser().profile;
                    profile.language = key;
                    if ($scope.principal.isAuthenticated()) {
                        ProfileService.putProfile(profile).then(function success() {
                            console.log('successfully updated user profile');
                        });
                    }
                }, function (err) {
                    console.log('could not switch language, err: ' + err);
                });
            };

            $scope.$on('language:changed', function (event, value) {
                $scope.changeLang(value);
            });

        }
    ])

    // somehow fixes the issue that datepicker does not dynamically change locale...
    // see here: https://github.com/lgalfaso/angular-dynamic-locale/issues/40

    .directive('datepicker', function () {
        return {
            restrict: 'EA',
            link: function(scope) {
                scope.$on('$localeChangeSuccess', function () {
                    scope.$$childHead.move(0);
                });
            }
        };
    });
