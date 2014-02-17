(function () {
    'use strict';


    angular.module('yp.organization')


        .factory("OrganizationService", ['$rootScope', 'Restangular','UserService',
            function ($rootScope, Rest, UserService) {

                var organizations = Rest.all('organizations');

                var OrganizationService = {

                    postOrganization: function(organization, success, error) {
                        organizations.post(organization).then(function(successResult) {
                            $rootScope.$broadcast('globalUserMsg', 'Organization ' + successResult.name + 'successfully created', 'success', 3000);
                            UserService.reload();
                            if(success) {success(successResult);}
                        }, function(errorResult) {
                            $rootScope.$broadcast('globalUserMsg', 'Organization not created: Error: ' + errorResult.data.message, 'danger', 3000);
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
