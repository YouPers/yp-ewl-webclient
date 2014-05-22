(function () {
    'use strict';

    angular.module('yp.dcm.organization',
        [
            'restangular',
            'ui.router'
        ])

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
                    });

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