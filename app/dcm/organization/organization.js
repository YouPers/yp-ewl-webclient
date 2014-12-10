(function () {
    'use strict';

    angular.module('yp.dcm')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('organization', {
                        url: "/organization/",
                        access: accessLevels.orgadmin,
                        templateUrl: 'dcm/organization/organization.html',
                        controller: 'OrganizationController as organizationController',
                        resolve: {

                            organizations: ['$stateParams', 'OrganizationService', function($stateParams, OrganizationService) {
                                return OrganizationService.getOrganizations();
                            }]
                        }
                    })
                    .state('assignCampaignLead', {
                        url: '/campaigns/{id}/becomeCampaignLead?accessToken',
                        access: accessLevels.all,
                        onEnter:['$state','$stateParams','CampaignService', 'UserService', '$rootScope', '$window',
                            function($state, $stateParams, CampaignService, UserService, $rootScope, $window) {
                                if (!$rootScope.principal.isAuthenticated()) {
                                    $rootScope.nextStateAfterLogin = {toState: 'assignCampaignLead', toParams: $stateParams};
                                    return $state.go('signup.content');
                                }

                                var campaignId = $stateParams.id;
                                var token = $stateParams.accessToken;
                                CampaignService.assignCampaignLead(campaignId, token).then(function(data) {
                                    $rootScope.$emit('clientmsg:success', 'campaign.lead');
                                    $state.go('dcm.home');
                                }, function(err) {

                                    if(err.data && err.data.code === 'InvalidArgumentError' && (err.data.data.userId || err.data.data.email)) {
                                        UserService.logout();
                                        $window.location.reload();
                                    } else {
                                        $state.go('dcm.home');
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

                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/organization/organization');
            }])
        .controller('OrganizationController', [ '$scope', '$state', '$filter', '$timeout', 'UserService', 'OrganizationService', 'organizations',
            function ($scope, $state, $filter, $timeout, UserService, OrganizationService, organizations) {

                $scope.organizationController = this;

                if(organizations.length > 1) {
                    $scope.$emit('clientmsg:error', 'organization.notUnique');
                }

                $scope.organization = organizations.length > 0 ? organizations[0] : {};

                var user = UserService.principal.getUser();

                var userFields = {
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email
                };

                $scope.organization.user = _.clone(userFields);

                function _localizedValues(prefix, range) {

                    var values = _.map(_.range(range), function(val) {
                        var key = prefix + (val+1);
//                        return key;
                        return {
                            key: key,
                            value: $filter('translate')(key)
                        };
                    });
                    return values;
                }

                $scope.sectors = _localizedValues('organization.sector.', 38);
                $scope.legalForms = _localizedValues('organization.legalForm.', 7);

                $scope.sectorSelected = function($item, $model, $label) {
                    $scope.organization.sector = $item.key;
                    $scope.sectorSearchModel = '';
                };

                $scope.validateOrganizationModel = function () {
                    var missingOrganizationFields = [];
                    _.each($scope.organizationForm, function (val, key) {
                        if(key.indexOf('$') !== 0 && !val.$modelValue) {
                            missingOrganizationFields.push(val.$name);
                        }
                    });

                    // select form components are not children of the form
                    var requiredSelectModels = [
                        'legalForm', 'sector'
                    ];
                    _.each(requiredSelectModels, function (model) {
                        if(!$scope.organization[model]) {
                            missingOrganizationFields.push(model);
                        }
                    });

                    if(missingOrganizationFields.length > 0) {
                        var markdown = '';
                        _.each(missingOrganizationFields, function (field) {
                            markdown += '\n - ' + $filter('translate')('organizationForm.' + field + '.label');
                        });
                        var message = $filter('translate')('healthCoach.dcm.organization.missingFields', { fields: markdown });
                        $scope.$root.$emit('healthCoach:displayMessage', message);
                    } else {
                        $scope.$root.$emit('healthCoach:displayMessage', '');
                    }
                };

                var onSave = function (organization) {

                    // save user if the relevant fields where changed
                    if(!_.isEqual($scope.organization.user, userFields)) {
                        userFields.fullname = userFields.firstname + ' ' + userFields.lastname;
                        _.extend(user, $scope.organization.user);
                        UserService.putUser(user);
                    }

                    $scope.validateOrganizationModel();

                    $scope.$emit('clientmsg:success', 'organization.saved');
                    $scope.organizationForm.$setPristine();
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