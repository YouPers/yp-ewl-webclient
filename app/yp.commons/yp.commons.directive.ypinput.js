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

                    // create model object in parent scope if it does not exist yet
                    if(!$scope.$parent[$scope.ypModel]) {
                        $scope.$parent[$scope.ypModel] = {};
                    }

                    // assign model object in this scope
                    $scope[$scope.ypModel] = $scope.$parent[$scope.ypModel];

                    // load contents of the element to compile it, which was prevented by 'ng-non-bindable'
                    var contents = $element.contents();


                    var input = $element.find('input');

                    // modify ng-model, interpolation does not work here
                    input.attr('ng-model', $scope.ypModel + '.' + name);

                    // include all attributes from parent input
                    _.forEach($attrs.$attr, function(value, key, list) {
                        input.attr($attrs.$attr[key], $attrs[key] ? $attrs[key] : true);
                    });


                    $scope.$watch($scope.ypFormName + '.' + name, function(input) {
                        if(input) {
                            $scope.errors = input.$error;
                        }
                    });

                    $element.children().removeAttr('ng-non-bindable');
                    $compile(contents)($scope);

                }
            };
        }]);

}());
