(function () {

    'use strict';

    angular.module('yp.dhc')
        .directive('activityEdit', ['$rootScope', '$state','accessLevels', 'ActivityService', 'UserService',
            function ($rootScope, $state, accessLevels, ActivityService, UserService) {
                return {
                    restrict: 'E',
                    scope: {
                        activity: '='
                    },
                    templateUrl: 'dhc/activity/activity-edit-directive.html',

                    link: function (scope, elem, attrs) {

                        scope.activity = _.clone(scope.activity);

                        _.extend(scope.activity, {
                            isScheduled: !!scope.activity.id,
                            isDeletable: scope.activity.deleteStatus.indexOf('deletable') === 0,
                            isEditable: scope.activity.editStatus.indexOf('editable') === 0
                        });
                        
                    }
                };
            }]);

}());