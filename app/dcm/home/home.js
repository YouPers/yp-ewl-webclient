(function () {
    'use strict';

    var _getOffersOptions = {
        populate: 'author idea activity',
        authored: true,
        authorType: 'campaignLead',
        publishTo: new Date(),
        publishFrom: false
    };

    var _getMessagesOptions = {
        populate: 'author',
        authored: true,
        authorType: 'campaignLead',
        publishTo: new Date(),
        publishFrom: false
    };


    function _sortSois(sis) {

        var offers = _.sortBy(_.filter(sis, function (si) {
            return si.__t === 'Recommendation' || si.__t === 'Invitation';
        }), function (si) {
            return si.publishFrom;
        });
        _.each(offers, function (offer) {
            offer.idea = offer.idea || offer.activity.idea;
        });

        return offers;

    }

    angular.module('yp.dcm')

        .config(['$stateProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('dcm.home', {
                        url: "/home",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dcm/home/home.html',
                                controller: 'HomeController as homeController'
                            }

                        },
                        resolve: {


                            jsInclude: ["util", function (util) {
                                return util.loadJSIncludes(['lib/d3/d3.min.js', 'lib/nvd3/nv.d3.min.js']);
                            }],

                            messages: ['SocialInteractionService', 'campaign', function(SocialInteractionService, campaign) {
                                if (campaign) {
                                    _getMessagesOptions.targetId = campaign.id;
                                    return SocialInteractionService.getMessages(_getMessagesOptions);
                                } else {
                                    return [];
                                }

                            }],

                            socialInteractions: ['SocialInteractionService', 'campaign', function(SocialInteractionService, campaign) {
                                if (campaign) {
                                    _getOffersOptions.targetId = campaign.id;
                                    return SocialInteractionService.getSocialInteractions(_getOffersOptions).then(_sortSois);
                                } else {
                                    return [];
                                }

                            }],


                            healthCoachEvent: ['OrganizationService', 'organization', 'campaigns', 'campaign', 'socialInteractions', 'messages', 'UserService',
                                function (OrganizationService, organization, campaigns, campaign, socialInteractions, messages, UserService) {


                                    var daysSinceCampaignStart = campaign ? moment().diff(moment(campaign.start), 'days', true) : undefined;
                                    var daysUntilCampaignEnd = campaign ? moment(campaign.end).diff(moment(), 'days', true) : undefined;

                                    if (!OrganizationService.isComplete(organization) && UserService.principal.isAuthorized('orgadmin')) {
                                        return 'organizationIncomplete';
                                    } else if (UserService.principal.getUser().avatar.indexOf('default') !== -1) {
                                        return 'noAvatarPicture';
                                    } else if(campaigns.length === 0) {
                                        return 'noCampaigns';
                                    } else if (socialInteractions.length === 0 && daysSinceCampaignStart <= -1) {
                                        return 'nothingOffered';
                                    } else if (messages.length === 0 && daysSinceCampaignStart <= -1) {
                                        return 'noMessages';
                                    } else if(daysSinceCampaignStart <= 0) {
                                        return 'oneDayOrMoreUntilCampaignStart';
                                    } else if(daysSinceCampaignStart <= 1) {
                                        return 'campaignStartedToday';
                                    } else if(daysSinceCampaignStart > 1 && daysSinceCampaignStart <= 7) {
                                        return 'campaignFirstWeek';
                                    } else if(daysSinceCampaignStart > 7 && daysUntilCampaignEnd > 7) {
                                        return 'campaignAfterFirstWeek';
                                    } else if(daysUntilCampaignEnd < 0) {
                                        return 'campaignEnded';
                                    } else if(daysUntilCampaignEnd <= 7) {
                                        return 'campaignLastWeek';
                                    }
                                }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/home/home');
            }])



        .controller('HomeController', ['$scope', '$rootScope', '$state', 'UserService', 'socialInteractions', 'messages', 'SocialInteractionService', 'campaign', 'campaigns', 'CampaignService', 'healthCoachEvent', '$translate',
            function ($scope, $rootScope, $state, UserService, socialInteractions, messages, SocialInteractionService, campaign, campaigns, CampaignService, healthCoachEvent, $translate) {

                $scope.homeController = this;
                $scope.homeController.healthCoachEvent = healthCoachEvent;
                $scope.homeController.formStatus = 'beforeTest';
                $scope.homeController.messages = messages;
                $scope.homeController.offerTypes = 'Invitation';
                $scope.campaign = campaign;
                if (campaign) {
                    $scope.campaignStarted = campaign && moment(campaign.start).isBefore(moment());
                    $scope.campaignEnding = moment().isAfter(campaign.end);
                }

                $scope.campaignStartAvailable = !$scope.campaignEnding;
                $scope.offersSectionAvailable = !$scope.campaignEnding;
                $scope.campaignStartOpen =  !$scope.campaignStarted;
                $scope.campaignStatsOpen =  $scope.campaignStarted && !$scope.campaignEnding;
                $scope.offers = socialInteractions;
                $scope.messages = messages;

                $scope.parseEmailAddresses = function (input) {
                    if(!input) {
                        return;
                    }
                    var list = input.match(/([_a-z0-9-]+(\.[_a-z0-9-]+)*(\+[a-z0-9-]+)?@[a-z0-9-]+(\.[a-z0-9-]+)*)/gi);
                    if(list && list.length > 0) {
                        $scope.homeController.emailAddressesToBeInvited = _.unique( ($scope.homeController.emailAddressesToBeInvited || []).concat(list) );
                    }
                };

                $scope.onEmailInviteSubmit = function(emailsToInvite, mailSubject, mailText) {
                    CampaignService.inviteParticipants(campaign.id, emailsToInvite, mailSubject, mailText).then(function () {
                        $scope.homeController.formStatus = 'sentSuccessful';
                    });
                };

                $scope.sendTestInvitationMail= function(mailSubject, mailText) {
                    CampaignService.inviteParticipants(campaign.id, $scope.principal.getUser().email, mailSubject, mailText, true).then(function () {
                        $scope.homeController.formStatus = 'afterTest';
                        $scope.homeController.healthCoachEvent = 'testEmailSent';
                    });
                };

                init();

                function _loadSocialInteractions() {
                    SocialInteractionService.getSocialInteractions(_getOffersOptions)
                        .then(_sortSois)
                        .then(function (sortedSois) {
                            $scope.offers = sortedSois;
                        });
                }

                /////////////////////
                function init () {
                    if (!campaign && campaigns.length > 0) {
                        return $state.go('dcm.home', { campaignId: campaigns[0].id });
                    }

                    if(campaign) {

                        $scope.$watch('homeController.offerTypes', function (offerTypes, oldValue) {
                            _getOffersOptions.discriminators = offerTypes;
                            _loadSocialInteractions();
                        }, true);

                        $scope.$watch('homeController.showOld', function (showOld, oldValue) {

                            _getOffersOptions.publishTo = showOld ? false : new Date();

                            _loadSocialInteractions();
                        });

                        $translate('dcmhome.emailInvite.emailSubject.defaultSubject', {
                            campaign: campaign
                        }).then(function (translatedText) {
                            $scope.emailSubject = translatedText;
                        });

                        $translate('dcmhome.emailInvite.emailText.defaultText', {
                            campaign: campaign
                        }).then(function (translatedText) {
                            $scope.emailText = translatedText;
                        });

                    }

                }

            }])


        .controller('HomeParticipantsController', ['$scope', 'UserService', function ($scope, UserService) {

            var homeParticipantsController = this;
            UserService.getUsers({ sort: 'lastname:1'}).then(function (users) {
                homeParticipantsController.participants = users;
            });

        }])

        .controller('HomeStatsController', ['$scope', 'StatsService', function ($scope, StatsService) {
            $scope.chartData = {};

            init();

            ///////////////////

            function init() {

                if ($scope.campaign) {
                    var options = {
                        runningTotal: true,
                        newestDay: moment.min(moment(), moment($scope.campaign.end)),
                        nrOfDaysToPlot: 7
                    };

                    StatsService.loadStats($scope.campaign.id, {type: 'newUsersPerDay', scopeType: 'campaign', scopeId: $scope.campaign.id}).then(function (result) {
                        $scope.chartData.newUsers = StatsService.fillAndFormatForPlot(result[0].newUsersPerDay, options);
                        $scope.currentUserCount = result[0].newUsersPerDay && result[0].newUsersPerDay[result[0].newUsersPerDay.length - 1] && result[0].newUsersPerDay[result[0].newUsersPerDay.length - 1].count;
                    });



                    StatsService.loadStats($scope.campaign.id, {type: 'activitiesPlannedPerDay', scopeType: 'campaign', scopeId: $scope.campaign.id}).then(function (result) {
                        $scope.chartData.plannedActs = StatsService.fillAndFormatForPlot(result[0].activitiesPlannedPerDay,  {
                            newestDay: moment(),
                            nrOfDaysToPlot: 7
                        });
                    });
                }
            }

        }])

    .controller('HomeMessagesController', ['$scope', '$rootScope', '$state', 'UserService', 'SocialInteractionService',
        function ($scope, $rootScope, $state, UserService, SocialInteractionService) {
            var self = this;
            self.messages = $scope.messages;

            self.onMessageSaved = function (message) {
                self.messages.unshift(message);
            };

            self.soiRemoved = function (soi) {
                _.remove(self.messages, { id: soi.id });
            };

            self.soiEdited = function (soi) {
                $scope.editedMessage = soi;
            };

            init();
           //-----------

            function init() {

                if ($scope.campaign) {

                    $scope.$watch('homeController.showOld', function (showOld) {
                        _getMessagesOptions.publishTo = showOld ? false : new Date();

                        SocialInteractionService.getMessages(_getMessagesOptions).then(function (messages) {
                            self.messages = messages;
                        });

                    });

                }

            }
        }]);

}());