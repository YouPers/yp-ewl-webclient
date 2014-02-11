(function () {
    'use strict';

    // internal functions

    /**
     * resolve a nested property of an object by specifying the property names, concatenated by a '.' (dot)
     * example: obj, 'foo.bar' => obj.foo.bar
     *
     *
     * @param o
     * @param s
     * @returns {*}
     */
    Object.byString = function(o, s) {
        s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        s = s.replace(/^\./, '');           // strip a leading dot
        var a = s.split('.');
        while (a.length) {
            var n = a.shift();
            if (n in o) {
                o = o[n];
            } else {
                return;
            }
        }
        return o;
    };

    /**
     * validates the format of an email address.
     * it just works ;-)
     * copied from here:
     * http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
     *
     * @param email
     * @returns {boolean}
     * @private
     */
    function _isValidEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    angular.module('yp.commons', [])

        .directive('form', [function () {
            return {
                restrict: 'E',
                require: 'form',
                link: function (scope, element, attrs, ctrl) {
                    scope.$on('formPristine', function () {
                        ctrl.$setPristine();
                    });

                    if(attrs['name']) {
                        scope.ypFormName = attrs['name'];
                    }
                    if(attrs['ypModel']) {
                        scope.ypModel = attrs['ypModel'];
                    }
                }
            };
        }])

        .filter('fromNow', function () {
            return function (dateString) {
                var myMoment = moment(dateString);

                if (myMoment.isBefore(moment().subtract('day', 3)) || myMoment.isAfter(moment().add('day', 3))) {
                    return myMoment.format('L');
                } else {
                    return myMoment.fromNow();
                }
            };
        })

        .filter('time', function () {
            return function (dateString) {
                var myMoment = moment(dateString);
                return myMoment.format('LT');
            };
        })


        .directive('setfocus', ['$timeout', function ($timeout) {
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
        }])

        .directive('multipleEmails', function () {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, elm, attrs, ctrl) {
                    ctrl.$parsers.unshift(function (viewValue) {
                        var allValid = true;

                        if (viewValue.length > 0) {
                            // split by , and ; and ' ' and check each resulting value
                            var parts = viewValue.split(/[\s,;]+/); // split by space, comma and semicolon
                            _.forEach(parts, function (part) {
                                if (!_isValidEmail(part)) {
                                    allValid = false;
                                }
                            });
                        }
                        if (allValid) {
                            ctrl.$setValidity('multipleEmails', true);
                            return viewValue;
                        } else {
                            ctrl.$setValidity('multipleEmails', false);
                            return undefined;
                        }
                    });
                }
            };
        })
        .directive('toggleValue', function() {
            return {
                restrict: 'A',
                link: function (scope, elm, attrs, ctrl) {
                    elm.bind('click', function() {
                        if(attrs.toggleValue) {
                            scope[attrs.toggleValue] = !scope[attrs.toggleValue];
                        }
                    });
                }
            };
        });


}());