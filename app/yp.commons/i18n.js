'use strict';

angular.module('i18n', ['pascalprecht.translate'])

    .controller('i18nCtrl', ['$scope', '$translate','$http',
        function ($scope, $translate, $http) {

        $scope.changeLang = function (key) {
            moment.lang(key);
            $http.defaults.headers.common['yp-language'] =  key;
            $translate.uses(key).then(function (key) {
                $translate.refresh();
                $scope.$state.go('bounce', {state: $scope.$state.current.name, params: JSON.stringify($scope.$stateParams)});
            }, function (key) {
            });
        };

    }
    ]);
