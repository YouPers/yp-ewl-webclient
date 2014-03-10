(function () {
    'use strict';


    angular.module('yp.organization')


        .factory("OrganizationService", ['ErrorService', 'Restangular','UserService',
            function (ErrorService, Rest, UserService) {

                var organizations = Rest.all('organizations');

                var OrganizationService = {

                    postOrganization: function(organization) {

                        return organizations.post(organization).then(

                            // success: don't show success notification by default as most of the time the resulting change is obvious
                            function(result) {
                                UserService.reload();
                                return result; // don't forget to return the result
                            },

                            ErrorService.defaultErrorCallback

                        );
                    },
                    getOrganizations: function() {
                        return organizations.getList();
                    }

                };

                return OrganizationService;

            }]);

}());
