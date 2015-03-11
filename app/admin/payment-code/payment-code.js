(function () {
    'use strict';


    angular.module('yp.admin')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {

                $stateProvider
                    .state('admin.payment-code', {
                        url: '/paymentCode',
                        access: accessLevels.admin,
                        views: {
                            content: {
                                templateUrl: "admin/payment-code/payment-code.html",
                                controller: 'PaymentCodeAdminController'
                            }
                        },

                        resolve: {
                            topics: ['TopicService', function(TopicService) {
                                return TopicService.getTopics();
                            }],
                            codes: ['PaymentCodeService', function (PaymentCodeService) {
                                return PaymentCodeService.getPaymentCodes({populate: 'author campaign marketPartner', populatedeep: 'campaign.organization'});
                            }],
                            partners: ['MarketPartnerService', function (MarketPartnerService) {
                                return MarketPartnerService.getMarketPartners();
                            }],
                            usersPerCampaign: ['StatsService', function (StatsService) {
                                return StatsService.loadStats(null, {
                                    type: 'usersPerCampaign',
                                    scopeType: 'all'
                                }).then(function(statsResults) {
                                    return _.indexBy(statsResults[0].usersPerCampaign,'campaign');
                                });
                            }]
                        }
                    });

                //$translateWtiPartialLoaderProvider.addPart('admin/payment-code/payment-code');
            }])

        .controller('PaymentCodeAdminController', ['$rootScope', '$scope', 'PaymentCodeService', 'topics', 'codes', 'partners', 'usersPerCampaign',
            function ($rootScope, $scope, PaymentCodeService, topics, codes, partners, usersPerCampaign) {

                $scope.codes = codes;
                $scope.topics = topics;
                $scope.productTypes = ['CampaignProductType1', 'CampaignProductType2', 'CampaignProductType3'];
                $scope.partners = partners;
                $scope.endorsementTypes = ['sponsored', 'presented'];
                $scope.usersPerCampaign = usersPerCampaign;

                $scope.validate = function(code) {
                    PaymentCodeService.validatePaymentCode({code: code}).then(function(result) {
                        $scope.paymentCode = result;
                        $scope.valid = true;
                    }, function(reason) {
                        $scope.valid = false;
                    });
                };

                $scope.generate = function(paymentCode) {
                    $rootScope.$log.log('paymentCode: ' + paymentCode);

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

                $scope.delete = function(paymentCodeId) {
                    PaymentCodeService.deletePaymentCode(paymentCodeId).then(function () {
                        _.remove($scope.codes, function(code) {
                            return code.id === paymentCodeId;
                        });
                    });

                };

                $scope.topic = function (topic) {
                    return _.find(topics, {id: topic});
                };


                $scope.paymentCode = {
                    productType: $rootScope.enums.productType[0],
                    topic: topics[0].id
                };

            }]);
}());
