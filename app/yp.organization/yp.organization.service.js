(function () {
    'use strict';


    angular.module('yp.organization')


        .factory("OrganizationService", ['$q', '$rootScope', 'Restangular','UserService',
            function ($q, $rootScope, Rest, UserService) {

                var organizations = Rest.all('organizations');

                var OrganizationService = {

                    postOrganization: function(organization) {

                        return organizations.post(organization).then(

                            // success: don't show success notification by default as most of the time the resulting change is obvious
                            function(result) {
                                UserService.reload();
                                return result; // don't forget to return the result
                            },

                            // error: display error notification, don't forget to return the rejected promise.
                            // we will have a problem of multiple errors if we want to display a more customized error later on
                            function(reason) {
                                $rootScope.$emit('notification:error', reason);
                                return $q.reject(reason); // unfortunately, we have to include a dependency to $q in every service
                            });
                    },
                    getOrganizations: function() {
                        return organizations.getList();
                    }

                };

                return OrganizationService;

            }]);

}());
