(function () {
    'use strict';


    angular.module('yp.activity')

        .controller('ActivityPlanInviteCtrl', ['$scope', 'ActivityService', 'activity', 'invitingUser', '$rootScope',
            function ($scope, ActivityService, activity, invitingUser, $rootScope) {


                // if the user is authenticated we immediatly go to the corresponding activity so he can join
                if ($scope.principal.isAuthenticated()) {
                    $scope.$state.go('activityPlan' , {activityId: activity.id});
                }

                $scope.activity = activity;
                $scope.invitingUser = invitingUser;

                $scope.showRegistrationDialog = function() {
                    $rootScope.$broadcast('loginMessageShow', {toState: 'activityPlan', toParams: {activityId: activity.id}, registration: true});
                };
            }
        ]);

}());
