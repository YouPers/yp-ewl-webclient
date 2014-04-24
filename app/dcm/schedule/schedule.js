(function () {
    'use strict';

    angular.module('yp.dcm.schedule',
        [
            'restangular',
            'ui.router'
        ])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('dcmschedule', {
                        templateUrl: "layout/default.html",
                        access: accessLevels.all
                    })
                    .state('dcmschedule.content', {
                        url: "/dcmschedule/:id?campaign&activity",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dcm/schedule/schedule.html',
                                controller: 'DcmScheduleController'
                            }
                        },
                        resolve: {
                            offer: ['$stateParams', 'ActivityService', 'CampaignService', 'UserService', '$q',
                                function ($stateParams, ActivityService, CampaignService, UserService, $q) {
                                    if (!$stateParams.id) {
                                        return $q.reject('no offer id passed in URL');
                                    } else if ($stateParams.id === 'NEW') {
                                        if (!$stateParams.activity || !$stateParams.campaign) {
                                            return $q.reject('activity and campaign Id are required for NEW offer');
                                        } else {
                                            return $q.all([ActivityService.getActivity($stateParams.activity),
                                                CampaignService.getCampaign($stateParams.campaign)])

                                                .then(function (results) {
                                                    var activity = results[0];
                                                    var campaign = results[1];

                                                    return {
                                                        activity: activity,
                                                        targetQueue: campaign.id,
                                                        campaign: campaign,
                                                        recommendedBy: [UserService.principal.getUser()],
                                                        type: [ activity.defaultExecutionType === 'group' ?
                                                            'campaignActivityPlan': 'campaignActivity' ],
                                                        sourceType: 'campaign',
                                                        validFrom: new Date(),
                                                        validTo: campaign.end,
                                                        plan: ActivityService.getDefaultPlan(activity),
                                                        prio: [500]
                                                    };

                                                });


                                            var deferred = $q.defer();
                                            deferred.resolve(ActivityService.getDefaultPlan());
                                            return deferred.promise;
                                        }
                                    } else {
                                        return ActivityService.getActivityOffer($stateParams.id);
                                    }

                                }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/schedule/schedule');
            }])
        .controller('DcmScheduleController', [ '$scope', '$state', 'ActivityService', 'offer',
            function ($scope, $state, ActivityService, offer) {

                $scope.offer = offer;

                // one time planning using daypicker
                $scope.showWeeks = false;
                $scope.minDate = new Date();

                $scope.dateOptions = {
                    'year-format': "'yy'",
                    'starting-day': 1
                };


            }
        ]);

}());