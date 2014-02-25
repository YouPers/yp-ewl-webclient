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
                        url: '/activities/:activityId',
                        templateUrl: "yp.organization/yp.activity.admin.campaign.html",
                        controller: 'CampaignController',
                        access: accessLevels.campaignlead,
                        resolve: {
                            activity: ['CampaignService', '$stateParams', function (CampaignService, $stateParams) {
                                return CampaignService.getCampaignActivity($stateParams.activityId);
                            }]
                        }
                    })

                    .state('assignCampaignLead', {
                        url: '/campaigns/{id}/becomeCampaignLead?token',
                        access: accessLevels.user,
                        onEnter:['$state','$stateParams','CampaignService', '$rootScope',
                            function($state, $stateParams, CampaignService, $rootScope) {
                                var campaignId = $stateParams.id;
                                var token = $stateParams.token;
                                CampaignService.assignCampaignLead(campaignId, token).then(function(data) {
                                    $rootScope.$broadcast('globalUserMsg', 'You are now a Campaign Lead of this campaign', 'success', 5000);
                                    $state.go('campaign', {id: campaignId});
                                }, function(err) {
                                    $rootScope.$broadcast('globalUserMsg', 'error', 'danger');
                                    console.log(JSON.stringify(err));
                                    $state.go('home');
                                });
                            }]

                    });

                $translateWtiPartialLoaderProvider.addPart('yp.organization');
            }])

        .controller('CampaignController', ['campaign', 'CampaignService', '$scope', '$rootScope', '$filter',
            function (campaign, CampaignService, $scope, $rootScope, $filter) {
                $scope.campaign = campaign;

                $scope.inviteCampaignLead = function(emails,campaign) {
                    CampaignService.inviteCampaignLead(emails, campaign.id).then(function() {
                        $scope.invitationSent = true;
                    }, function(err) {
                        $rootScope.$broadcast('globalUserMsg', 'Error sending invitation: '+ JSON.stringify(err), 'danger', 5000);
                    });
                };

                // validate and store a updated campaign

                $scope.updateCampaign = function() {
                    var startDate = moment($scope.campaign.start);
                    var endDate = moment($scope.campaign.end);
                    if (startDate.diff(endDate) < 0) {
                        // start date is earlier than end date, so we try to create the campaign
                        CampaignService.putCampaign($scope.campaign);
                    } else {
                        $rootScope.$broadcast('globalUserMsg', 'Campaign not updated: Campaign end date must be later than campaign start date ');
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
                                $scope.campaignStats.assTotals = result[0].totalUsers;
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

                $scope.activity = {};

                var initCampaignActivity = function() {

                    $scope.activity.title = "Mustertitel";
                    $scope.activity.text = "Mustertext";

                };

                initCampaignActivity();

                // validate and store a new campaign activity

                $scope.save = function() {

                    if ($scope.activity.id) {
                        // we are updating an existing campaign activity
                        CampaignService.putCampaignActivity($scope.activity);
                    } else {
                        // we are creating a new campaign activity

                        // use as Number (for the time being) the value "NEW_C to distinguish it from new YouPers Activities (number = "NEW"), until a numbering specification exists
                        $scope.activity.number = "NEW_C";

                        // web client needs to forward the campaign id, this new activity belongs to
                        // if not, the backend will not execute the save
                        $scope.activity.campaign = $scope.campaign.id;
                        CampaignService.postCampaignActivity($scope.activity, function(campaignActivity) {
                            $scope.campaignActivities.push(campaignActivity);
                            initCampaignActivity();
                        });

                    }
                };

                var getCampaignActivities = function() {

                    if(_.contains($scope.principal.getUser().roles, 'orgadmin')) {
                        CampaignService.getCampaignActivities({limit:1000}).then(function(campaignActivities) {
                            var allActivities = campaignActivities;
                            $scope.campaignActivities = $filter('CampaignActivityFilter')(allActivities, $scope.campaign.id);
                        }, function(err) {
                            $rootScope.$broadcast('globalUserMsg', 'getCampaignActivitiess: not authorized');
                        });
                    } else {
                        $scope.campaignActivities = [];
                    }


                };

                getCampaignActivities();

            }
        ])
        .filter('CampaignActivityFilter', [function () {
            return function (activities, campaignId) {
                var out = [];

                // if we do not get a campaign ID, we return an empty array
                if (!campaignId) {
                    return out;
                }

                angular.forEach(activities, function (activity, key) {

                        if (activity.campaign && activity.campaign === campaignId) {
                            out.push(activity);
                        }

                    }
                );
                return out;

            };
        }]
        );
}());
