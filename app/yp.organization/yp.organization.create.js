(function () {
    'use strict';


    angular.module('yp.organization')


        .controller('CreateOrganizationController', ['$scope', 'OrganizationService',
            function ($scope, OrganizationService) {

                var getOrganizations = function() {
                    OrganizationService.getOrganizations().then(function(organizations) {
                        $scope.organization = organizations[0];
                    });
                };
                getOrganizations();


                $scope.organization = {};

                $scope.createOrganization = function() {
                    OrganizationService.postOrganization($scope.organizationObj, function(organization) {
                        $scope.organization = organization;
                    });
                };

            }]);
}());
