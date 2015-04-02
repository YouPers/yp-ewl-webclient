(function () {

    'use strict';

    angular.module('yp.components')

        .directive('endorsement', ['$rootScope', '$sce',
            function ($rootScope, $sce) {
                return {
                    restrict: 'EA',
                    scope: {
                        campaign: '='
                    },
                    templateUrl: 'components/directives/endorsement-directive/endorsement-directive.html'
                };
            }]);

}());