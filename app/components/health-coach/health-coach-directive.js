(function () {

    'use strict';

    angular.module('yp.dhc')
        .directive('healthCoach', ['$rootScope', 'HealthCoachService', '$state', '$translate','$sce',
            function ($rootScope, HealthCoachService, $state, $translate, $sce) {
            return {
                restrict: 'E',
                scope: {},
                templateUrl: 'components/health-coach/health-coach-directive.html',

                link: function (scope, elem, attrs) {
                    HealthCoachService.getCoachMessages($state.current.name).then(function (result) {
                        scope.coachMessages = result;
                    });

                    $rootScope.$on('healthCoach:displayMessage', function (even, message) {
                        scope.coachMessages.unshift(message);
                    });

                    $rootScope.$on('event:authority-deauthorized', function() {
                        HealthCoachService.getCoachMessages($state.current.name).then(function (result) {
                            scope.coachMessages = result;
                        });
                    });

                    $rootScope.$on('event:authority-authorized', function() {
                        HealthCoachService.getCoachMessages($state.current.name).then(function (result) {
                            scope.coachMessages = result;
                        });
                    });

                },
                controller: ['$scope','$sce', function($scope, $sce) {
                    $scope.isTranslatable = function() {
                        return ($scope.coachMessages &&
                            $scope.coachMessages.length >0 &&
                            $scope.coachMessages[0].lastIndexOf('hcmsg.') === 0);
                    };

                    $scope.getFormattedMessage = function(message) {
                        if ($scope.coachMessages && $scope.coachMessages.length >0) {
                            var myMsg = $scope.coachMessages[0];
                            if (myMsg.lastIndexOf('hcmsg.') === 0) {
                                // this is a translatable ressource key
                                return $sce.trustAsHtml('key' + myMsg);
                            } else {
                                return $sce.trustAsHtml(markdown.toHTML(myMsg));
                            }
                        } else {
                            return "";
                        }
                    };
                }]
            };
        }])
        .config(['$translateWtiPartialLoaderProvider', function($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('components/health-coach/health-coach');
        }]);

}());