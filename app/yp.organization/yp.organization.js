(function () {
    'use strict';


    angular.module('yp.organization', ['ui.router'])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {

                $stateProvider
                    .state('organization', {
                        url: '/organization',
                        templateUrl: 'yp.organization/yp.organization.create.html',
                        controller: 'CreateOrganizationController',
                        access: accessLevels.user
                    })

                    .state('campaign', {
                        url: '/campaign/{id}',
                        templateUrl: 'yp.organization/yp.campaign.html',
                        controller: 'CampaignController',
                        access: accessLevels.campaignlead,
                        resolve: {
                            campaign: ['CampaignService', '$stateParams', function(CampaignService, $stateParams) {
                                return CampaignService.getCampaign($stateParams.id);
                            }]
                        }
                    })

                    .state('editCampaignActivity', {
                        url: '/activities/:activityId/edit',
                        templateUrl: "yp.activity/yp.activity.campaign.html",
                        controller: 'ActivityEditCtrl',
                        access: accessLevels.campaignlead,
                        resolve: {
                            activity: ['ActivityService', '$stateParams', function (ActivityService, $stateParams) {
                                return ActivityService.getActivity($stateParams.activityId);
                            }],
                            activityType: [function () {
                                return "campaign";
                            }]
                        }
                    })

                    .state('assignCampaignLead', {
                        url: '/campaigns/{id}/becomeCampaignLead?token',
                        access: accessLevels.user,
                        onEnter:['$state','$stateParams','CampaignService', 'UserService', '$rootScope', '$window',
                            function($state, $stateParams, CampaignService, UserService, $rootScope, $window) {
                                var campaignId = $stateParams.id;
                                var token = $stateParams.token;
                                CampaignService.assignCampaignLead(campaignId, token).then(function(data) {
                                    $rootScope.$emit('notification:success', 'campaign.lead');
                                    $state.go('campaign', {id: campaignId});
                                }, function(err) {

                                    if(err.data && err.data.code === 'InvalidArgumentError' && (err.data.data.userId || err.data.data.email)) {
                                        UserService.logout();
                                        $window.location.reload();
                                    } else {
                                        $rootScope.$emit('notification:error', err);
                                        $state.go('home');
                                    }
                                });
                            }]

                    });

                $translateWtiPartialLoaderProvider.addPart('yp.organization');
            }])

        .controller('CampaignController', ['campaign', 'CampaignService', 'ActivityService', 'Restangular', '$scope', '$rootScope',
            function (campaign, CampaignService, ActivityService, Rest, $scope, $rootScope) {
                $scope.campaign = campaign;

                $scope.inviteCampaignLead = function(emails,campaign) {
                    CampaignService.inviteCampaignLead(emails, campaign.id).then(function() {
                        $scope.invitationSent = true;
                    }, function(err) {
                        $rootScope.$emit('notification:error', err);
                    });
                };

                $scope.dateOptions = {
                    'year-format': "'yy'",
                    'starting-day': 1
                };

                // validate and store a updated campaign

                $scope.updateCampaign = function() {
                    var startDate = moment($scope.campaign.start);
                    var endDate = moment($scope.campaign.end);
                    if (startDate.diff(endDate) < 0) {
                        // start date is earlier than end date, so we try to create the campaign
                        CampaignService.putCampaign($scope.campaign);
                    } else {
                        $rootScope.$emit('notification:error', 'campaign.dateRange');
                    }
                };

                var getCampaignStats = function() {
                    if ($scope.campaign.id) {

                        $scope.campaignStats = {};

                        CampaignService.getCampaignStats($scope.campaign.id, 'assUpdatesTotal').then(function(result) {
                            if (result.length > 0) {
                                $scope.campaignStats.assUpdatesTotal = result[0].updatesTotal;
                            }
                        });

                        CampaignService.getCampaignStats($scope.campaign.id, 'assTotals').then(function(result) {
                            if (result.length > 0) {
                                $scope.campaignStats.assTotals = result[0].totalAssessments;
                            }
                        });
                        CampaignService.getCampaignStats($scope.campaign.id, 'activitiesPlannedTotal').then(function(result) {
                            if (result.length > 0) {
                                $scope.campaignStats.activitiesPlannedTotal = result[0].activitiesPlannedTotal;
                            }
                        });
                        CampaignService.getCampaignStats($scope.campaign.id, 'activityEventsTotal').then(function(result) {
                            if (result.length > 0) {
                                $scope.campaignStats.activityEventsTotal = result[0].eventsTotal;
                            }
                        });
                        CampaignService.getCampaignStats($scope.campaign.id, 'usersTotal').then(function(result) {
                            if (result.length > 0) {
                                $scope.campaignStats.usersTotal = result[0].usersTotal;
                            }
                        });
                    }
                };

                getCampaignStats();

                var initCampaignActivity = function() {

                    $scope.activity = Rest.restangularizeElement(null, {
                        number: 'NEW_C',
                        source: "campaign",
                        defaultfrequency: "once",
                        "defaultexecutiontype": "self",
                        "defaultvisibility": "private",
                        "defaultduration": 60,
                        topics: ['workLifeBalance']
                    }, 'activities');

                    $scope.activityType = "campaign";

                };

                initCampaignActivity();

                // validate and store a new campaign activity

                $scope.save = function() {

                    if ($scope.activity.id) {
                        // we are updating an existing campaign activity
                        ActivityService.saveActivity($scope.activity);
                    } else {
                        // we are creating a new campaign activity

                        // use as Number (for the time being) the value "NEW_C to distinguish it from new YouPers Activities (number = "NEW"), until a numbering specification exists
                        $scope.activity.number = "NEW_C";

                        // web client needs to forward the campaign id, this new activity belongs to
                        // if not, the backend will not execute the save
                        $scope.activity.campaign = $scope.campaign.id;
                        ActivityService.saveActivity($scope.activity, function(campaignActivity) {
                            $scope.campaignActivities.push(campaignActivity);
                            initCampaignActivity();
                        });

                    }
                };

                var getCampaignActivities = function() {

                    if(_.contains($scope.principal.getUser().roles, 'campaignlead')) {
                        var params = {
                            'filter[campaign]': $scope.campaign.id
                        };
                        $scope.campaignActivities = ActivityService.getActivities(params).then(function(campaignActivities) {
                            $scope.campaignActivities = campaignActivities;
                        }, function(err) {
                            $rootScope.$emit('notification:error', err);
                        });
                    } else {
                        $scope.campaignActivities = [];
                    }


                };

                getCampaignActivities();

            }
        ]);
}());
