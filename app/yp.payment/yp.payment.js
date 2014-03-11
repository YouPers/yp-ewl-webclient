(function () {
    'use strict';

    angular.module('yp.payment', ['ui.router'])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {

                $stateProvider
                    .state('paymentCodeAdmin', {
                        url: '/paymentCode',
                        templateUrl: 'yp.payment/yp.payment.code.admin.html',
                        controller: 'PaymentCodeAdminController',
                        access: accessLevels.user
                    });

                $translateWtiPartialLoaderProvider.addPart('yp.payment');
            }]);

}());
