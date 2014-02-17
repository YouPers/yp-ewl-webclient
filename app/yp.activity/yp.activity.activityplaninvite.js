(function () {
    'use strict';


    angular.module('yp.activity')

        .controller('ActivityPlanInviteCtrl', ['$scope', '$compile', 'ActivityService', 'activity', 'invitingUser', '$rootScope',
            function ($scope, $compile, ActivityService, activity, invitingUser, $rootScope) {


                // if the user is authenticated we immediatly go to the corresponding activity so he can join
                if ($scope.principal.isAuthenticated()) {
                    $scope.$state.go('activityPlan' , {activityId: activity.id});
                }

                $scope.activity = activity;
                $scope.invitingUser = invitingUser;

                $scope.showRegistrationDialog = function() {
                    $rootScope.$broadcast('loginMessageShow', {toState: 'activityPlan', toParams: {activityId: activity.id}, registration: true});
                };

                $scope.inviteMessageParams = {
                    loginLinkAttribute: 'href="/#/activities/'+$scope.activity.id+'"',
                    registerLinkAttribute: 'ng-click="showRegistrationDialog()"'
                };
            }
        ]);

}());
