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
                        templateUrl: "layout/dcmdefault.html",
                        access: accessLevels.all
                    })
                    .state('dcmschedule.content', {
                        url: "/dcmschedule/:id?activity&offerType",
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
                                        if (!$stateParams.activity) {
                                            return $q.reject('activity id is required as param for NEW offer');
                                        } else {
                                            return ActivityService.getActivity($stateParams.activity)
                                                .then(function (activity) {

                                                    var campaign = CampaignService.currentCampaign;

                                                    return {
                                                        activity: activity,
                                                        targetQueue: campaign.id,
                                                        campaign: campaign,
                                                        recommendedBy: [UserService.principal.getUser()],
                                                        type: [ $stateParams.offerType ||
                                                            (activity.defaultexecutiontype === 'group' ?
                                                            'campaignActivityPlan' : 'campaignActivity')],
                                                        sourceType: 'campaign',
                                                        validFrom: new Date(),
                                                        validTo: campaign.end,
                                                        activityPlan: [ActivityService.getDefaultPlan(activity, campaign.id)],
                                                        prio: [500]
                                                    };

                                                });
                                        }
                                    } else {
                                        return ActivityService.getActivityOffer($stateParams.id);
                                    }
                                }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/schedule/schedule');
            }])
        .controller('DcmScheduleController', [ '$rootScope', '$scope', '$state', 'ActivityService', 'offer',
            function ($rootScope, $scope, $state, ActivityService, offer) {

                $scope.offer = offer;


                offer.isScheduled = offer.type[0] === 'campaignActivityPlan' && offer.activityPlan[0].id;
                offer.isDeletable = (offer.type[0] === 'campaignActivity') ||
                    (offer.isScheduled && offer.activityPlan[0].deleteStatus.indexOf('deletable') === 0);
                offer.isEditable =  (offer.type[0] === 'campaignActivity') ||
                    (offer.activityPlan[0].editStatus === 'editable');

                $scope.plan = offer.activityPlan[0];

                // one time planning using daypicker
                $scope.showWeeks = false;
                $scope.minDate = new Date();

                $scope.dateOptions = {
                    'year-format': "'yy'",
                    'starting-day': 1
                };

                $scope.saveOffer = function () {
                    ActivityService.saveActivityOffer($scope.offer).then(
                        function (savedOffer) {
                            $scope.offer.id = savedOffer.id;
                            $rootScope.$emit('clientmsg:success', 'activityOffer.saved');
                        },
                        function (err) {
                            console.log(err);

                        }
                    )
                    ;

                };

                $scope.deleteOffer = function () {
                    ActivityService.deleteOffer($scope.offer).then(function () {
                        $rootScope.$emit('clientmsg:success', 'activityOffer.delete');
                        $rootScope.back();
                    });
                };


            }
        ])
    ;

} ());