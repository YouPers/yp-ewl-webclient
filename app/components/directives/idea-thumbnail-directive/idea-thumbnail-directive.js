(function () {

    'use strict';

    angular.module('yp.components.ideaThumbnail', [])
        .directive('ideaThumbnail', ['$rootScope', '$sce', function ($rootScope, $sce) {
            return {
                restrict: 'EAC',
                scope: {
                    idea: '='
                },
                template: "<img ng-src=\"{{'/assets/actpics/' + idea.number + '.jpg'}}\">",
//                templateUrl: 'components/directives/idea-card-directive/idea-card-directive.html',

                link: function (scope, elem, attrs) {


                }
            };
        }]);

}());