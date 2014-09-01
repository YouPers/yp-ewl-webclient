(function () {

    'use strict';

    angular.module('yp.dhc')
        .directive('activityEdit', ['$rootScope', '$state','accessLevels', 'ActivityService', 'UserService',
            function ($rootScope, $state, accessLevels, ActivityService, UserService) {
                return {
                    restrict: 'E',
                    scope: {
                        activity: '&',
                        onSave: '=',
                        onCancel: '=',
                        onDelete: '='
                    },
                    templateUrl: 'dhc/activity/activity-edit-directive.html',

                    link: function (scope, elem, attrs) {

                        scope.activity = _.clone(scope.activity());

                        _.extend(scope.activity, {
                            isScheduled: !!scope.activity.id,
                            isDeletable: scope.activity.deleteStatus.indexOf('deletable') === 0,
                            isEditable: scope.activity.editStatus.indexOf('editable') === 0
                        });

                        scope.saveActivity = function() {

                            ActivityService.savePlan(scope.activity).then(function (savedActivity) {
                                $rootScope.$emit('clientmsg:success', 'activityPlan.save');

                                // if a campaign activity Plan has been created, send sample invite to the author
                                var user = UserService.principal.getUser();
                                if (_.contains(user.roles, 'campaignlead') && savedActivity.source === 'campaign') {
                                    scope.$broadcast('formPristine');
                                    ActivityService.inviteEmailToJoinPlan(user.email, savedActivity).then(function (result) {
                                        $rootScope.$emit('clientmsg:success', 'activityPlan.sampleInvitationSent', { values: { email: user.email }});
                                    });
                                }


                                if(attrs.onSave && typeof scope.onSave === 'function') {
                                    scope.onSave(savedActivity);
                                }

                            });

                        };

                        scope.deleteActivity = function () {

                            ActivityService.deletePlan(scope.activity).then(function (result) {
                                $rootScope.$emit('clientmsg:success', 'activityPlan.delete');

                                if(attrs.onDelete && typeof scope.onDelete === 'function') {
                                    scope.onDelete();
                                }
                            });

                        };

                        scope.cancel = function() {

                            if(attrs.onCancel && typeof scope.onCancel === 'function') {
                                scope.onCancel();
                            }
                        };

                        
                    }
                };
            }]);

}());