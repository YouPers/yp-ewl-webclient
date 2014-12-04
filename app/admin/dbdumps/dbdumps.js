(function () {
    'use strict';


    angular.module('yp.admin')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('dbdumps', {
                        templateUrl: "layout/admin-default.html",
                        access: accessLevels.admin
                    })

                    .state('dbdumps.content', {
                        url: "/admin/dbdumps",
                        access: accessLevels.admin,
                        views: {
                            content: {
                                templateUrl: "admin/dbdumps/dbdumps.html",
                                controller: 'AdminDbdumpsCtrl'
                            }
                        },
                        resolve: {
                            dbdumps: ['Restangular', function (restangular) {
                                return restangular.all('/dbdumps').getList();
                            }]
                        }
                    });
            }])

        .controller('AdminDbdumpsCtrl', [
            '$scope', '$rootScope', 'UserService', 'dbdumps', 'Restangular',
            function ($scope, $rootScope, UserService, dbdumps, Restangular) {


                $scope.dbdumps = dbdumps;

                $scope.deleteDump = function deleteDump(dumpName) {
                    Restangular
                        .all('dbdumps')
                        .one(dumpName)
                        .remove()
                        .then(function () {
                            $rootScope.$emit('clientmsg:success', 'dump removed: ' + name);
                            $scope.dbdumps = _.without($scope.dbdumps, dumpName);
                        });
                };

                $scope.newDump = function newDump(name) {
                    Restangular.all('dbdumps').post(null, {dumpname: name})
                        .then(function (result) {
                            $rootScope.$emit('clientmsg:success', 'database dumped to:' + name);
                            $scope.dbdumps.push(name);
                        });
                };


                $scope.restoreDump = function newDump(name) {
                    var r = window.confirm("Are you sure? this will delete all data and restore the dump!");
                    if (r) {
                        Restangular.all('dbdumps').one(name).all('restore').post()
                            .then(function (result) {
                                $rootScope.$emit('clientmsg:success', 'database restored from:' + name);
                            });
                    }
                };

            }]);


}());