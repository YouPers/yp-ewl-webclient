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

                    })
                    .state('assignOrganizationAdmin', {
                        url: '/organizations/{id}/becomeOrganizationAdmin?token',
                        access: accessLevels.user,
                        onEnter:['$state','$stateParams','OrganizationService', 'UserService', '$rootScope', '$window',
                            function($state, $stateParams, OrganizationService, UserService, $rootScope, $window) {
                                var organizationId = $stateParams.id;
                                var token = $stateParams.token;
                                OrganizationService.assignOrganizationAdmin(organizationId, token).then(function(data) {
                                    $rootScope.$emit('notification:success', 'organization.lead');
                                    $state.go('organization', {id: organizationId});
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
            }]);

}());
