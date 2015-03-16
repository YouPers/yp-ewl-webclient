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
                                controller: 'PaymentCodeAdminController as ctrl'
                            }
                        },

                        resolve: {
                            topics: ['TopicService', function (TopicService) {
                                return TopicService.getTopics();
                            }],
                            codes: ['PaymentCodeService', function (PaymentCodeService) {
                                return PaymentCodeService.getPaymentCodes({
                                    populate: 'author campaign marketPartner',
                                    populatedeep: 'campaign.organization'
                                });
                            }],
                            partners: ['MarketPartnerService', function (MarketPartnerService) {
                                return MarketPartnerService.getMarketPartners();
                            }],
                            usersPerCampaign: ['StatsService', function (StatsService) {
                                return StatsService.loadStats(null, {
                                    type: 'usersPerCampaign',
                                    scopeType: 'all'
                                }).then(function (statsResults) {
                                    return _.indexBy(statsResults[0].usersPerCampaign, 'campaign');
                                });
                            }]
                        }
                    });

                //$translateWtiPartialLoaderProvider.addPart('admin/payment-code/payment-code');
            }])

        .controller('PaymentCodeAdminController', ['$rootScope', '$scope', 'PaymentCodeService', 'topics', 'codes', 'partners', 'usersPerCampaign',
            function ($rootScope, $scope, PaymentCodeService, topics, codes, partners, usersPerCampaign) {
                var self = this;

                self.codes = codes;
                self.topics = topics;
                self.productTypes = ['CampaignProductType1', 'CampaignProductType2', 'CampaignProductType3'];
                self.partners = partners;
                self.endorsementTypes = ['sponsored', 'presented'];

                self.validate = function (code) {
                    PaymentCodeService.validatePaymentCode({code: code}).then(function (result) {
                        self.paymentCode = result;
                        self.valid = true;
                    }, function (reason) {
                        self.valid = false;
                    });
                };

                self.generate = function (paymentCode) {
                    $rootScope.$log.log('paymentCode: ' + paymentCode);

                    PaymentCodeService.generatePaymentCode(paymentCode).then(function (result) {
                        // the author is not populated in the post result, we do it manually
                        result.author = $rootScope.principal.getUser();
                        // populate the marketPartner
                        result.marketPartner = _.find(self.partners, 'id', result.marketPartner);
                        self.codes = self.codes || [];
                        if (!_.contains(self.codes, function (pc) {
                                return pc.code === result.code;
                            })) {
                            self.codes.push(result);
                        }

                        self.code = result.code;
                        self.valid = true;
                    }, function (err) {
                        $rootScope.$emit('clientmsg:error', err);
                    });
                };

                self.saveCode = function (code, index) {
                    PaymentCodeService.putPaymentCode(code).then(function (result) {
                        // repopulate the marketpartner
                        result.marketPartner = _.find(self.partners, 'id', result.marketPartner);
                        self.currentEdit = undefined;
                        self.codes[index] = result;
                    }, function (err) {
                        $rootScope.$emit('clientmsg:error', err);
                    });
                };

                self.delete = function (paymentCodeId) {
                    PaymentCodeService.deletePaymentCode(paymentCodeId).then(function () {
                        _.remove(self.codes, function (code) {
                            return code.id === paymentCodeId;
                        });
                    });

                };

                self.topic = function (topic) {
                    return _.find(topics, {id: topic});
                };


                self.paymentCode = {
                    productType: $rootScope.enums.productType[0],
                    topic: topics[0].id
                };

                self.edit = function (code, index) {
                    self.currentEdit = index;
                    self.editCode = code.clone();
                };

                self.cancelEdit = function () {
                    self.currentEdit = undefined;
                    self.editCode = undefined;
                };

                self.getUsersPerCampaign = function (campaignId) {
                    if (usersPerCampaign[campaignId]) {
                        return usersPerCampaign[campaignId].usersTotal;
                    } else {
                        return 0;
                    }
                };
            }]);
}());
