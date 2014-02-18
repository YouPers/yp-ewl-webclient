(function () {
    'use strict';

    angular.module('yp.commons')
        .directive('ypInput', ['$compile', '$filter', function ($compile, $filter) {
            return {
                scope: {
                    ngModel: "="
//                    ypFormName: "="
                },
                restrict: 'E',
                templateUrl: 'yp.commons/yp.commons.directive.ypinput.html',

                link: function ($scope, $element, $attrs) {

                    var name = $attrs['name'];
                    if(!name) {
                        throw 'ypInput: name is required';
                    }

                    var ypInputName = name;
                    var ypFormName = $element.parent('form').attr('name');
                    var ypModel = $element.parent('form').attr('ypModel');

                    var input = $element.find('input');
                    _.forEach($attrs.$attr, function(key) {
                        input.attr(key, $attrs[key]);
                    });

                    input.attr('ng-model', ypModel + '.' + name);
                    input.attr('placeholder', $filter('translate')(ypFormName + '.' + name + '.placeholder'));

                    var html = $element.html();

                    var compiled = $compile(html)($scope);
                    $element.replaceWith(compiled);


                    var span = $element.find('span');

                }
            };
        }]);

}());
