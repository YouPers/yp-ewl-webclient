'use strict';

angular.module('yp.components.i18n', ['pascalprecht.translate', 'yp.components.user', 'tmh.dynamicLocale'])
    .config(['tmhDynamicLocaleProvider', function(tmhDynamicLocaleProvider) {
        tmhDynamicLocaleProvider.localeLocationPattern('lib/angular-i18n/angular-locale_{{locale}}.js');
    }])
    .controller('i18nCtrl', ['$scope', '$translate', '$http', '$rootScope', 'ProfileService', 'tmhDynamicLocale', 'yp.config',
        function ($scope, $translate, $http, $rootScope, ProfileService, tmhDynamicLocale, config) {

            $scope.currentLang = $translate.use();

            $scope.isEnabled = function(key) {
                return !_.contains(config.availableLanguages, key);
            };

            $scope.changeLang = function (key) {

                // check whether the chosen language is currently supported
                if (!_.contains(config.availableLanguages, key)) {
                    return;
                }

                // change the the locale for the angular.js-internal i18n framework (date-, number-, currency-filters, etc.)
                // using a special library (angular-dynamic-locale), because by design the angular language
                // system would need a full page reload
                // mainly used here for number-filter and the UI-bootstrap widgets (datepicker, timepicker)
                tmhDynamicLocale.set(key);

                // change the locale of moment.js used for formatting dates and times
                moment.locale(key);

                // store the key at the scope to be displayed in the menubar
                $scope.currentLang = key;

                // change the locale for the youpers backend for getting dynamic data from the API
                $http.defaults.headers.common['yp-language'] = key;

                // change the locale for angular-translate (text translation), works asynchronously
                $translate.use(key).then(function (key) {
                    $translate.refresh();
                    $scope.$state.go('bounce', {state: $scope.$state.current.name, params: JSON.stringify($scope.$stateParams)});
                    $rootScope.currentLocale = $translate.use() || $translate.proposedLanguage();

                    // store the last language a user chose in the user's profile, so we know a user's language when
                    // we need to send him notifications/emails from the backend.
                    var profile = $scope.principal.getUser().profile;
                    if (profile.language !== key) {
                        profile.language = key;
                        if ($scope.principal.isAuthenticated()) {
                            ProfileService.putProfile(profile).then(function success() {
                                $rootScope.$log.log('successfully updated user profile');
                            });
                        }
                    }
                }, function (err) {
                    $rootScope.$log.log('could not switch language, err: ' + err);
                });
            };

            $scope.$on('language:changed', function (event, value) {
                $scope.changeLang(value);
            });

        }
    ])

    // the ui-bootstrap datepicker does not dynamically change locale...
    // this somehow fixes this issue, don't ask me how this works
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
