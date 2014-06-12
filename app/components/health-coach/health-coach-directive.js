(function () {

    'use strict';

    angular.module('yp.components.healthCoach')
        .directive('healthCoach', ['$rootScope', 'HealthCoachService', '$window', '$timeout', '$state', '$translate','$sce',
            function ($rootScope, HealthCoachService, $window, $timeout, $state, $translate, $sce) {
            return {
                restrict: 'E',
                scope: {},
                templateUrl: 'components/health-coach/health-coach-directive.html',

                link: function (scope, elem, attrs) {
                    HealthCoachService.getCoachMessages($state.current.name).then(function (result) {
                        scope.coachMessages = result;
                    });

                    scope.style = {
                        top: 0
                    };

                    var offset = 0;

                    scope.updateStyle = function updateStyle() {
                        offset = $window.pageYOffset;
                        scope.style = {
                            'top': Math.max(0, offset - 90) + 'px',
                            position: 'relative'
                        };
                    };

                    angular.element($window).on('scroll', function() {
                        if($window.pageYOffset < offset) {
                            scope.$apply(scope.updateStyle);
                        }
                    });


                    scope.isTranslatable = function() {
                        return (scope.coachMessages &&
                            scope.coachMessages.length >0 &&
                            scope.coachMessages[0].lastIndexOf('hcmsg.') === 0);
                    };

                    scope.getFormattedMessage = function(message) {
                        if (scope.coachMessages && scope.coachMessages.length >0) {
                            var myMsg = scope.coachMessages[0];
                            if (myMsg.lastIndexOf('hcmsg.') === 0) {
                                // this is a translatable ressource key
                                return $sce.trustAsHtml('key' + myMsg);
                            } else {
                                return $sce.trustAsHtml(marked(myMsg));
                            }
                        } else {
                            return "";
                        }
                    };

                    scope.dismiss = function() {
                        scope.coachMessages = [];
                    };

                    $rootScope.$on('healthCoach:displayMessage', function (event, message, interpolateParams) {
                        if (!scope.coachMessages) {
                            scope.coachMessages = [];
                        }
                        scope.coachMessages.unshift(message);
                        scope.interpolateParams = interpolateParams;
                        scope.updateStyle();
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

                }
            };
        }]);

}());