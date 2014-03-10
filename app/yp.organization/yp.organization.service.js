(function () {
    'use strict';


    angular.module('yp.organization')


        .factory("OrganizationService", ['$rootScope', 'Restangular','UserService',
            function ($rootScope, Rest, UserService) {

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
                    postOrganization: function(organization, success, error) {
                        organizations.post(organization).then(function(successResult) {
                            $rootScope.$emit('notification:success', 'organization.save', { values: { organization: successResult.name }});
                            UserService.reload();
                            if(success) {success(successResult);}
                        }, function(errorResult) {
                            $rootScope.$emit('notification:error', errorResult);
                            if(error) {error(errorResult);}
                        });
                    },
                    getOrganizations: function() {
                        return organizations.getList();
                    }

                };

                return OrganizationService;

            }]);

}());
