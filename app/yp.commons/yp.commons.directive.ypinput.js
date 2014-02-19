(function () {
    'use strict';

    angular.module('yp.commons')
        .directive('ypInput', ['$compile', '$filter', function ($compile, $filter) {
            return {
                scope: {
                    // isolated
                },
                restrict: 'E',
                templateUrl: 'yp.commons/yp.commons.directive.ypinput.html',

                link: function ($scope, $element, $attrs) {

                    var name = $attrs['name'];
                    if(!name) {
                        throw 'ypInput: input "name" is required';
                    }

                    $scope.ypInputName = name;

                    // get name and model object from parent form
                    var form = $element.parent('form');
                    $scope.ypFormName = form.attr('name');
                    if(!$scope.ypFormName) {
                        throw 'ypInput: attribute "name" is required in the parent form';
                    }
                    $scope[$scope.ypFormName] = $scope.$parent[$scope.ypFormName];
                    $scope.ypModel = form.attr('ypModel');
                    if(!$scope.ypModel) {
                        throw 'ypInput: attribute "ypModel" is required in the parent form';
                    }


                    // load contents of the element to compile it, which was prevented by 'ng-non-bindable'
                    var contents = $element.contents();

                    // include all attributes from parent input
                    var input = $element.find('input');
                    _.forEach($attrs.$attr, function(key) {
                        input.attr(key, $attrs[key] ? $attrs[key] : true);
                    });

                    // modify ng-model, interpolation does not work here
                    input.attr('ng-model', $scope.ypModel + '.' + name);


                    $element.children().removeAttr('ng-non-bindable');
                    $compile(contents)($scope);

                }
            };
        }]);

}());
