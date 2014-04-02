(function () {

    'use strict';

    angular.module('yp.dhc')
        .directive('stopPropagation', ['$rootScope', function ($rootScope) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    element.bind(attrs.stopEvent || 'click', function (e) {
                        e.stopPropagation();
                    });
                }
            };
        }]);

}());