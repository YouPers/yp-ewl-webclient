(function () {
    'use strict';

    angular.module('yp.dcm')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', 'activityResolveConfiguration',
            function ($stateProvider, $urlRouterProvider, accessLevels, activityResolveConfiguration) {
                $stateProvider
                    .state('dcm.recommendation', {
                        url: "/recommendation/:idea/socialInteraction/:socialInteraction",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dcm/activity/recommendation.html',
                                controller: 'RecommendationController as recommendationController'
                            }
                        },
                        resolve: activityResolveConfiguration
                    });

            }])

        .controller('RecommendationController', [ '$scope', '$rootScope', '$state', '$stateParams', '$timeout',
            'UserService', 'ActivityService', 'SocialInteractionService',
            'campaign', 'idea', 'activity', 'activityEvents', 'socialInteraction', 'campaignInvitation', 'invitationStatus',
            function ($scope, $rootScope, $state, $stateParams, $timeout, UserService, ActivityService, SocialInteractionService, campaign, idea, activity, activityEvents, socialInteraction, campaignInvitation, invitationStatus) {


            }]);

}());