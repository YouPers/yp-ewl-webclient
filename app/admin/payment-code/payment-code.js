(function () {
    'use strict';


    angular.module('yp.admin')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {

                $stateProvider
                    .state('paymentCodeAdmin', {
                        url: '/paymentCode',
                        templateUrl: 'admin/payment-code/payment-code.html',
                        controller: 'PaymentCodeAdminController',
                        access: accessLevels.admin,

                        resolve: {
                            topics: ['TopicService', function(TopicService) {
                                return TopicService.getTopics();
                            }]
                        }
                    });

                //$translateWtiPartialLoaderProvider.addPart('admin/payment-code/payment-code');
            }])

        .controller('PaymentCodeAdminController', ['$rootScope', '$scope', 'PaymentCodeService', 'topics',
            function ($rootScope, $scope, PaymentCodeService, topics) {


                $scope.validate = function(code) {
                    PaymentCodeService.validatePaymentCode(code).then(function(result) {
                        $scope.paymentCode = result;
                        $scope.valid = true;
                    }, function(reason) {
                        $scope.valid = false;
                    });
                };

                $scope.generate = function(paymentCode) {
                    console.log('paymentCode: ' + paymentCode);

                    PaymentCodeService.generatePaymentCode(paymentCode).then(function(result) {
                        $scope.codes = $scope.codes || [];
                        if(!_.contains($scope.codes, function(pc) { return pc.code === result.code; })) {
                            $scope.codes.push(result);
                        }

                        $scope.code = result.code;
                        $scope.valid = true;
                    }, function (err) {
                        $scope.$emit('clientmsg:error', err);
                    });
                };

                $scope.topic = function (topic) {
                    return _.find(topics, {id: topic});
                };

                $scope.topics = topics;
                $scope.productTypes = ['CampaignProductType1', 'CampaignProductType2', 'CampaignProductType3'];

                $scope.paymentCode = {
                    productType: $rootScope.enums.productType[0],
                    topic: topics[0].id
                };

                PaymentCodeService.getPaymentCodes().then(function(codes) {
                    $scope.codes = codes;
                });

            }]);
}());
