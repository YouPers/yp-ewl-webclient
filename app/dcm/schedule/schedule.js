(function () {
    'use strict';

    angular.module('yp.dcm')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('dcmschedule', {
                        templateUrl: "layout/dcm-default.html",
                        access: accessLevels.all
                    })
                    .state('dcmschedule.content', {
                        url: "/dcmschedule/:id?idea&offerType",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dcm/schedule/schedule.html',
                                controller: 'DcmScheduleController'
                            }
                        },
                        resolve: {
                            offer: ['$stateParams', 'ActivityService', 'CampaignService', 'UserService', '$q', '$state',
                                function ($stateParams, ActivityService, CampaignService, UserService, $q, $state) {
                                    if (!$stateParams.id) {
                                        return $q.reject('no offer id passed in URL');
                                    } else if ($stateParams.id === 'NEW') {
                                        if (!$stateParams.idea) {
                                            return $q.reject('idea id is required as param for NEW offer');
                                        } else if (!CampaignService.currentCampaign) {
                                            return $q.reject('no current Campaign, cannot schedule without knowing for which campaign');
                                        } else {
                                            return ActivityService.getIdea($stateParams.idea)
                                                .then(function (idea) {

                                                    var campaign = CampaignService.currentCampaign;

                                                    return {
                                                        idea: idea,
                                                        targetQueue: campaign.id,
                                                        campaign: campaign,
                                                        recommendedBy: [UserService.principal.getUser()],
                                                        offerType: [ ($stateParams.offerType || (idea.defaultexecutiontype === 'group' ?
                                                            'campaignActivityPlan' : 'campaignActivity'))],
                                                        sourceType: 'campaign',
                                                        validFrom: new Date(moment().startOf('day')),
                                                        validTo: new Date(moment(campaign.end).endOf('day')),
                                                        activityPlan: [ActivityService.getDefaultPlan(idea, campaign.id)],
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

                offer.isScheduled = offer.offerType[0] === 'campaignActivityPlan' && offer.activityPlan[0].id;
                offer.isDeletable = (offer.offerType[0] === 'campaignActivity') ||
                    (offer.isScheduled && offer.activityPlan[0].deleteStatus.indexOf('deletable') === 0);
                offer.isEditable =  (offer.offerType[0] === 'campaignActivity') ||
                    (offer.activityPlan[0].editStatus === 'editable');
                offer.isJoinedPlan = offer.activityPlan && offer.activityPlan[0] && offer.activityPlan[0].joiningUsers &&  offer.activityPlan[0].joiningUsers.length > 0;

                $scope.getJoiningUsers = function (plan) {
                    return _.pluck(plan.joiningUsers.slice(1), 'fullname').join('<br/>');
                };

                $scope.plan = offer.activityPlan[0];



                $scope.saveOffer = function () {
                    ActivityService.saveActivityOffer($scope.offer).then(
                        function (savedOffer) {
                            $scope.offer.id = savedOffer.id;
                            $rootScope.$emit('clientmsg:success', 'activityOffer.saved');
                            $state.go('campaignoffers.content');
                        },
                        function (err) {
                            console.log(err);

                        }
                    );

                };

                $scope.inviteEmailToJoinPlan = function (email, activityPlan) {
                    $scope.inviteEmail = "";
                    ActivityService.inviteEmailToJoinPlan(email, activityPlan).then(function (result) {
                        $rootScope.$emit('clientmsg:success', 'activityPlan.invite', { values: { email: email } });
                        $scope.$broadcast('formPristine');
                    });
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