(function () {
    'use strict';


    angular.module('yp.components.util.directives', [])

        .directive('translateMarkdown', ['$translate', function ($translate) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    if(!attrs.translateMarkdown) {
                        throw new Error('translateMarkdown: attribute value is required');
                    }
                    $translate(attrs.translateMarkdown).then(function (translatedValue) {
                        element.html(marked(translatedValue));
                    });

                }
            };
        }])

        .directive('selectOnClick', function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    function selectElementContents(el) {
                        var range = document.createRange();
                        range.selectNodeContents(el[0]);
                        var sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }

                    element.on('click', function () {
                        selectElementContents(element);
                    });
                }
            };
        })

        /**
         * find all children that are input elements and register a select-on-click handler for each of them
         */
        .directive('selectOnChildInputClick', function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    _.each(element.find('input'), function (input) {
                        angular.element(input).on('click', function () {
                            this.setSelectionRange(0, this.value.length)
                        });
                    });
                }
            };
        })

        .directive('synchronizedDate', [function () {
            return {
                restrict: 'A',
                scope: {
                    date: '=ngModel',
                    synchronizedDate: '=' // date that will be updated accordingly when the first date changes
                },
                link: function (scope, element, attrs, ctrl) {


                    scope.$watch('date', function(val, old) {
                        if(val && old && old !== val) {
                            var synchronizedDate = moment(scope.synchronizedDate).add(moment(val).diff(old)).toISOString();
                            scope.synchronizedDate = old ? synchronizedDate : val;
                        }
                    });

                    scope.$watch('synchronizedDate', function(newVal) {
                        if(moment(newVal).isBefore(moment(scope.date))) {
                            scope.synchronizedDate = scope.date;
                        }
                    });

                }
            };
        }])

        .directive('scrollAlong', ['$window', function ($window) {
            return {
                restrict: 'A',

                link: function (scope, element, attrs, ctrl) {

                    scope.style = {
                        top: 0
                    };

                    var offset = 0;
                    var initialOffset = element[0].offsetTop;

                    function initStyle() {
                        offset = $window.pageYOffset;
                        element.css('top', Math.max(0, offset - initialOffset) + 'px');
                        element.css('position', 'relative');
                        scope.style = {
                            'top': Math.max(0, initialOffset - 90) + 'px',
                            position: 'relative'
                        };
                    }

                    // initialize vertical position
                    // typical use case: content changes the user should be aware of
                    scope.$on('initialize-scroll-along', initStyle);

                    // scroll along when the user scrolls back to top
                    angular.element($window).on('scroll', function() {
                        if($window.pageYOffset < offset) {
                            scope.$apply(initStyle);
                        }
                    });


                }
            };
        }])

        .directive('form', [function () {
            return {
                restrict: 'E',
                require: 'form',
                link: function (scope, element, attrs, ctrl) {
                    scope.$on('formPristine', function () {
                        ctrl.$setPristine();
                    });
                }
            };
        }])


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

        .directive('futureDate', [function () {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, elem, attrs, control) {

                    scope.$watch(function () {
                        return attrs.futureDate ? attrs.futureDate : control.$modelValue;
                    }, function (date) {
                        var isValid = moment(date).isAfter(moment());
                        control.$setValidity("future-date", isValid);
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


        .directive('toggleValue', function () {
            return {
                restrict: 'A',
                link: function (scope, elm, attrs, ctrl) {
                    elm.bind('click', function () {
                        if (attrs.toggleValue) {
                            scope[attrs.toggleValue] = !scope[attrs.toggleValue];
                        }
                    });
                }
            };
        })

        .directive('stopPropagation', ['$rootScope', function ($rootScope) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    element.bind(attrs.stopEvent || 'click', function (e) {
                        e.stopPropagation();
                    });
                }
            };
        }])

        .directive('uniqueUserField', ['UserService', function (UserService) {
            return {
                require: 'ngModel',
                link: function (scope, elm, attrs, ctrl) {

                    var initialValue;

                    // onchange instead of onblur is nice, but we should not hit the server all the time
                    var validate = function (value) {

                        var user = {};
                        user[attrs.name] = value; // currently only username and email are checked in the backend

                        if (!value) {
                            return;
                        }

                        // validate only if the value does not equal the initial value

                        if(!initialValue) {
                            initialValue = value;
                        } else if(initialValue !== value) {

                            _.throttle(function () {

                                // validate and use a "unique" postfix to have different error messages

                                UserService.validateUser(user).then(function (res) {
                                    ctrl.$setValidity("unique", true);
                                }, function (err) {
                                    ctrl.$setValidity("unique", false);
                                });

                            }, 500)();
                        }



                        // we can't return undefined for invalid values as it is validated asynchronously
                        return value;
                    };

                    ctrl.$parsers.unshift(validate); // user input
                    ctrl.$formatters.unshift(validate); // model change

                }
            };
        }])

    ;



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


}());