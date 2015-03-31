(function () {

    'use strict';

    angular.module('yp.components')
        .directive('addThisEvent', ['$rootScope', '$state', '$stateParams', 'UserService', '$timeout',
            function ($rootScope, $state, $stateParams, UserService, $timeout) {
                return {
                    restrict: 'E',
                    scope: {
                        activity: '='
                    },
                    templateUrl: 'components/directives/add-this-event-directive/add-this-event.html',

                    link: function (scope, elem, attrs) {

                        // using $timeout here because addthisevent can only run after this template has
                        // bin rendered.
                        $timeout(function() {
                            addthisevent.refresh();
                        });
                    }
                };
            }]);

}());
