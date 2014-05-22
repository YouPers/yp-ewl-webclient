(function () {
    'use strict';

    angular.module('yp.dcm')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('organization', {
                        templateUrl: "layout/dcm-default.html",
                        access: accessLevels.user
                    })
                    .state('organization.content', {
                        url: "/organization/",
                        access: accessLevels.user,
                        views: {
                            content: {
                                templateUrl: 'dcm/organization/organization.html',
                                controller: 'OrganizationController'
                            }
                        },
                        resolve: {

                            organizations: ['$stateParams', 'OrganizationService', function($stateParams, OrganizationService) {
                                return OrganizationService.getOrganizations();
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
                                    $rootScope.$emit('clientmsg:success', 'campaign.lead');
                                    $state.go('campaign', {id: campaignId});
                                }, function(err) {

                                    if(err.data && err.data.code === 'InvalidArgumentError' && (err.data.data.userId || err.data.data.email)) {
                                        UserService.logout();
                                        $window.location.reload();
                                    } else {
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
                                    $rootScope.$emit('clientmsg:success', 'organization.lead');
                                    $state.go('organization', {id: organizationId});
                                }, function(err) {
                                    if(err.data && err.data.code === 'InvalidArgumentError' && (err.data.data.userId || err.data.data.email)) {
                                        UserService.logout();
                                        $window.location.reload();
                                    } else {
                                        $state.go('home');
                                    }
                                });
                            }]

                    });;

                $translateWtiPartialLoaderProvider.addPart('dcm/organization/organization');
            }])
        .controller('OrganizationController', [ '$scope', '$state', 'OrganizationService', 'organizations',
            function ($scope, $state, OrganizationService, organizations) {

                if(organizations.length > 1) {
                    $scope.$emit('clientmsg:error', 'organization.notUnique');
                }

                $scope.organization = organizations.length > 0 ? organizations[0] : {};


                var onSave = function (organization) {
                    $scope.$emit('clientmsg:success', 'organization.saved');
                    $scope.organization = organization;
                    $state.go('dcm-home.content');
                };

                $scope.saveOrganization = function() {
                    if($scope.organization.id) {
                        OrganizationService.putOrganization($scope.organization).then(onSave);
                    } else {
                        OrganizationService.postOrganization($scope.organization).then(onSave);
                    }
                };

            }
        ]);

}());