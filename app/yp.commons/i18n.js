'use strict';

angular.module('i18n', ['pascalprecht.translate'])

    .controller('i18nCtrl', ['$scope', '$translate','$http', 'ActivityService', 'AssessmentService',
        function ($scope, $translate, $http, ActivityService, AssessmentService) {

        $scope.changeLang = function (key) {
            moment.lang(key);
            $http.defaults.headers.common['yp-language'] =  key;
            $translate.uses(key).then(function (key) {
                ActivityService.reloadActivities();
                AssessmentService.reloadAssessment();
                $scope.$state.go('bounce', {state: $scope.$state.current.name, params: JSON.stringify($scope.$stateParams)});
            }, function (key) {
            });
        };

    }
    ]);
