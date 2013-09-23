'use strict';

angular.module('yp.commons', []).
    filter('fromNow',function () {
        return function (dateString) {
            return moment(new Date(dateString)).fromNow();
        };
    }).

    filter('fromNowFake',function () {
        return function (dateString) {
            return moment(new Date(dateString)).from(new Date(2013, 7, 20, 13, 30));
        };
    }).


    directive('setfocus', ['$timeout', function ($timeout) {
        return {
            link: function (scope, element, attrs) {
                scope.$watch(attrs.setfocus, function (val) {
                    if (angular.isDefined(val) && val) {
                        $timeout(function () {
                            element[0].focus();
                        });
                    }
                }, true);

                element.bind('blur', function () {
                    if (angular.isDefined(attrs.ngFocusLost)) {
                        scope.$apply(attrs.ngFocusLost);

                    }
                });
            }
        };
    }])

    .directive('passwordMatch', [function () {
        return {
            restrict: 'A',
            scope: true,
            require: 'ngModel',
            link: function (scope, elem, attrs, control) {
                var checker = function () {

                    //get the value of the first password
                    var e1 = scope.$eval(attrs.ngModel);

                    //get the value of the other password
                    var e2 = scope.$eval(attrs.passwordMatch);
                    return e1 === e2;
                };
                scope.$watch(checker, function (n) {

                    //set the form control to valid if both
                    //passwords are the same, else invalid
                    control.$setValidity("unique", n);
                });
            }
        };
    }]);
