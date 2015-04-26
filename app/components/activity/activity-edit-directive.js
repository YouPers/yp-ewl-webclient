(function () {

    'use strict';

    angular.module('yp.components.activity')
        .directive('activityEdit', [
            function () {
                return {
                    restrict: 'E',
                    scope: {
                        activity: '=',
                        campaign: '=',// used to set the min/max range for the date picker
                        form: '=', // we pass the form to the parent scope, to react on validations.
                        isCampaignLead: '='
                    },
                    templateUrl: 'components/activity/activity-edit-directive.html',

                    link: function (scope, elem, attrs) {

                        scope.$watch('activityForm', function(val) {
                            scope.form = val;
                        });

                        _.extend(scope.activity, {
                            isScheduled: !!scope.activity.id,
                            isDeletable: scope.activity.deleteStatus.indexOf('deletable') === 0,
                            isEditable: scope.activity.editStatus.indexOf('editable') === 0
                        });
                        
                    }
                };
            }]);

}());