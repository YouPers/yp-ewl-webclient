(function () {

    'use strict';

    angular.module('yp.components.activity')
        .directive([
            function () {
                return {
                    restrict: 'E',
                    scope: {
                        activity: '='
                    },
                    templateUrl: 'components/activity/activity-edit-directive.html',

                    link: function (scope, elem, attrs) {

                        scope.activity = scope.activity;

                        _.extend(scope.activity, {
                            isScheduled: !!scope.activity.id,
                            isDeletable: scope.activity.deleteStatus.indexOf('deletable') === 0,
                            isEditable: scope.activity.editStatus.indexOf('editable') === 0
                        });
                        
                    }
                };
            }]);

}());