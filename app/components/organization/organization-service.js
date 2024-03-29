(function () {
    'use strict';


    angular.module('yp.components.organization')


        .factory("OrganizationService", ['ErrorService', 'Restangular','UserService',
            function (ErrorService, Rest, UserService) {

                var organizations = Rest.all('organizations');

                var OrganizationService = {
                    inviteOrganizationAdmin: function (email, organizationId) {
                        return organizations.one(organizationId).all('/inviteOrganizationAdminEmail').post({email: email});
                    },
                    assignOrganizationAdmin: function (organizationId, token) {
                        return organizations.one(organizationId).all('/assignOrganizationAdmin').post('', {token: token}).then(function success(result) {
                            UserService.reload();
                        });
                    },
                    putOrganization: function(organization) {
                        return organization.put();
                    },
                    postOrganization: function(organization) {

                        return organizations.post(organization).then(function(result) {
                                UserService.reload();
                                return result; // don't forget to return the result
                            }
                        );
                    },
                    getOrganizations: function() {
                        return organizations.getList();
                    },

                    isComplete: function (organization) {
                        if (!organization) {
                            return false;
                        }
                        return !!organization.name &&
                            organization.address &&
                            !!organization.address.street &&
                            !!organization.address.zipCode &&
                            !!organization.address.city &&
                            !!organization.legalForm &&
                            !!organization.sector &&
                            !!organization.contact &&
                            !!organization.contact.position &&
                            !!organization.contact.phone;
                    }
                };
                return OrganizationService;
            }]);
}());
