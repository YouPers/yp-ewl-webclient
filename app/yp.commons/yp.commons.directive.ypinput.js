(function () {
    'use strict';

    angular.module('yp.commons')
        .directive('ypInput', [function (UserService) {
            return {
                scope: {
                    ngModel: "=",
                    ypFormName: "="
                },
                restrict: 'E',
                templateUrl: 'yp.commons/yp.commons.directive.ypinput.html',
                link: function (scope, elem, attrs) {

                    var name = attrs['name'];
                    if(!name) {
                        throw 'ypInput: name is required';
                    }


                    var input = elem.find('input');
                    _.forEach(attrs.$attr, function(key) {
                        input.attr(key, attrs[key]);
                    });

                    scope.ypInputName = name;
//                    scope.model = scope[scope.ypModel][name];
//                    input.attr('ng-model', scope.ypModel + '.' + name);

                    var span = elem.find('span');

                }
            };
        }]);

}());
