'use strict';

angular.module('yp.commons', [])
    .directive('header', function () {
        return {
            restrict: 'EA',
            transclude: true,
            templateUrl: 'js/directives/header.html',
            scope: { }, // isolated
            link: function (scope, elem, attrs) {

                scope.items = [
                    { "name": "commit", "url": "#/topics"},
                    { "name": "assess", "url": "#/assessment/525faf0ac558d40000000005"},
                    { "name": "plan", "url": "#/activities"},
                    { "name": "do", "url": "#/cockpit"},
                    { "name": "evaluate", "url": "#/evaluate"}
                ];

                scope.isActive = function(index) {
                    return attrs.name === scope.items[index].name;
                };
            }
        };
    });