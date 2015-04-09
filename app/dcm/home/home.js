(function () {
    'use strict';

    var _getOffersOptions = {
        populate: 'author idea activity',
        authored: true,
        publishTo: new Date(),
        publishFrom: false,
        authorType: 'campaignLead',
        dismissed: true
    };

    var _getAllCurrentAndFutureOffersOptions = _.clone(_getOffersOptions);

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

                                    // setup the _getOffersOptions for future calls
                                    _getOffersOptions.targetId = campaign.id;

                                    // but use the default one, because we want to get all on initial page load
                                    _getAllCurrentAndFutureOffersOptions.targetId = campaign.id;
                                    return SocialInteractionService.getSocialInteractions(_getAllCurrentAndFutureOffersOptions).then(_sortSois);
                                } else {
                                    return [];
                                }

                            }],

                            currentAndFutureInvitations: ['socialInteractions', function(socialInteractions) {
                                return _.filter(socialInteractions, function(soi) {
                                    return soi.__t === 'Invitation' && soi.authorType=== 'campaignLead';
                                });
                            }],


                            healthCoachEvent: ['OrganizationService', 'organization', 'campaigns', 'campaign', 'socialInteractions', 'messages', 'UserService',
                                function (OrganizationService, organization, campaigns, campaign, socialInteractions, messages, UserService) {


                                    var daysSinceCampaignStart = campaign ? moment().diff(moment(campaign.start), 'days', true) : undefined;
                                    var daysUntilCampaignEnd = campaign ? moment(campaign.end).diff(moment(), 'days', true) : undefined;

                                    if (!OrganizationService.isComplete(organization) && UserService.principal.isAuthorized('orgadmin')) {
                                        return 'organizationIncomplete';
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



        .controller('HomeController', ['$scope', '$translate',
            'UserService', 'CampaignService', 'SocialInteractionService',
            'socialInteractions', 'currentAndFutureInvitations', 'messages',  'campaign', 'campaigns', 'healthCoachEvent',
            function ($scope, $translate,
                      UserService, CampaignService, SocialInteractionService,
                      socialInteractions, currentAndFutureInvitations, messages, campaign, campaigns, healthCoachEvent) {

                $scope.homeController = this;
                $scope.homeScope = $scope;
                $scope.homeController.healthCoachEvent = healthCoachEvent;
                $scope.homeController.messages = messages;
                $scope.homeController.offerTypes = 'Invitation';
                $scope.campaign = campaign;

                var now = moment();

                if (campaign) {
                    $scope.campaignStarted = campaign && moment(campaign.start).isBefore(now);
                    $scope.campaignEnded = now.isAfter(campaign.end);

                    $scope.campaignStartAvailable = !$scope.campaignEnded;
                    $scope.offerSectionAvailable = !$scope.campaignEnded;
                    $scope.campaignMessagesAvailable = !$scope.campaignEnded;
                    $scope.campaignEndAvailable = moment().businessDiff(moment(campaign.end).startOf('day')) > -2;

                    // campaign start section is open until the campaign has started
                    $scope.campaignStartOpen =  moment(campaign.start).isAfter(now, 'day');
                    // campaign end section is open when the campaign has ended
                    $scope.campaignEndOpen = $scope.campaignEnded;
                    // offer section is open otherwise
                    $scope.offerSectionOpen = !$scope.campaignEndOpen && !$scope.campaignStartOpen;
                }


                $scope.offers = socialInteractions;
                $scope.currentAndFutureInvitations = currentAndFutureInvitations;
                $scope.messages = messages;
                $scope.emailAddress = UserService.principal.getUser().email;

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
                    $scope.homeController.emailInvitesSent = false;
                    CampaignService.inviteParticipants(campaign.id, emailsToInvite, mailSubject, mailText).then(function () {
                        $scope.homeController.emailInvitesSent = true;
                        $scope.completeCampaignPreparation(5);
                    });
                };

                $scope.sendTestInvitationMail= function(mailSubject, mailText) {
                    $scope.homeController.testEmailSent = false;
                    CampaignService.inviteParticipants(campaign.id, $scope.principal.getUser().email, mailSubject, mailText, true).then(function () {
                        $scope.homeController.testEmailSent = true;
                        $scope.homeController.healthCoachEvent = 'testEmailSent';
                    });
                };

                $scope.displayCoachMsg = function(section) {
                    $translate('healthCoach.dcm.home.sectionOpening.' + section).then(function (translated) {
                        $scope.$root.$emit('healthCoach:displayMessage', translated);
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
                        return $scope.$state.go('dcm.home', { campaignId: campaigns[0].id });
                    }

                    if(campaign) {

                        $scope.offersWithoutLocation = _.filter(currentAndFutureInvitations, function (offer) {
                            return offer.__t === 'Invitation' && !offer.activity.location;
                        });
                        $scope.campaignPreparation = {
                            step1: {
                                complete: !UserService.hasDefaultAvatar(campaign.campaignLeads[0])
                            },
                            step2: {
                                complete: CampaignService.isComplete(campaign)
                            },
                            step3: {
                                complete: $scope.offersWithoutLocation.length === 0
                            },
                            step4: {
                                complete: (campaign.preparationComplete >= 4)
                            },
                            step5: {
                                complete: (campaign.preparationComplete >= 5)
                            }

                        };
                        var firstIncompleteStep = _.find($scope.campaignPreparation, { complete: false });
                        if (firstIncompleteStep) {
                            firstIncompleteStep.active = true;
                            firstIncompleteStep.enabled = true;
                        } else {
                            // enable last step
                            $scope.campaignPreparation.step5.active = true;
                        }

                        _.each($scope.campaignPreparation, function (step) {
                            step.disabled = !step.enabled && !step.complete;
                        });

                        $scope.completeCampaignPreparation = function (step) {
                            $scope.campaignPreparation['step' + step].complete = true;
                            if ( $scope.campaignPreparation['step' + (step+1)]) {
                                $scope.campaignPreparation['step' + (step+1)].active = true;
                                $scope.campaignPreparation['step' + (step+1)].enabled = true;
                                $scope.campaignPreparation['step' + (step+1)].disabled = false;
                            }
                            campaign.preparationComplete = step;
                            CampaignService.putCampaign(campaign);
                        };

                        $scope.homeController.welcomeLink = $scope.config.webclientUrl + '/#' + $scope.$state.href('welcome',{campaignId: campaign.id});
                        var createDraftLocals = {
                            organizationName: campaign.organization.name,
                            welcomeLink: $scope.homeController.welcomeLink
                        };

                        $scope.homeController.createDraftUrl =
                            'mailto:' + encodeURI($translate.instant('dcmhome.campaignStart.welcomeLink.createDraft.recipient')) +
                            '?subject=' + encodeURI($translate.instant('dcmhome.campaignStart.welcomeLink.createDraft.subject', createDraftLocals)) +
                            '&body=' + encodeURI($translate.instant('dcmhome.campaignStart.welcomeLink.createDraft.body', createDraftLocals));

                        $scope.$watch('homeController.offerTypes', function (offerTypes, oldValue) {
                            if(offerTypes === 'All') {
                                _getOffersOptions.discriminators = '';
                                _getOffersOptions.authorType = undefined;
                            } else {
                                _getOffersOptions.discriminators = offerTypes;
                                _getOffersOptions.authorType = 'campaignLead';
                            }

                            _loadSocialInteractions();
                        }, true);

                        $scope.$watch('homeController.showOld', function (showOld, oldValue) {

                            _getOffersOptions.publishTo = showOld ? false : new Date();

                            _loadSocialInteractions();
                        });

                    }

                }

            }])


        .controller('HomeParticipantsController', ['$scope', 'UserService', function ($scope, UserService) {

            var homeParticipantsController = this;

            if($scope.campaign) {
                init();
            }

            function init() {
                UserService.getUsers({campaign: $scope.campaign.id, sort: 'lastname:1'}).then(function (users) {
                    homeParticipantsController.participants = users;
                });
            }

        }])

        .controller('HomeStatsController', ['$scope', '$translate', 'StatsService', 'ActivityService', function ($scope, $translate, StatsService, ActivityService) {
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



                    StatsService.loadStats($scope.campaign.id, {type: 'eventsDonePerDay', scopeType: 'campaign', scopeId: $scope.campaign.id}).then(function (result) {
                        var prefix = 'dcmhome.stats.eventsDonePerDay.legend.';
                        options = {
                            runningTotal: false,
                            newestDay: moment($scope.campaign.end),
                            oldestDay: moment($scope.campaign.start),
                            propsToPlot: ['Done', 'Missed', 'Open'],
                            legend: [
                                $translate.instant(prefix + 'Done'),
                                $translate.instant(prefix + 'Missed'),
                                $translate.instant(prefix + 'Open')
                            ]
                        };

                        $scope.chartData.eventsDonePerDay = StatsService.fillAndFormatForPlot(result[0].eventsDonePerDay, options);
                    });


                    StatsService.loadStats($scope.campaign.id, {type: 'newUsersPerDay', scopeType: 'campaign', scopeId: $scope.campaign.id}).then(function (result) {
                        var options = {
                            runningTotal: true,
                            newestDay: moment($scope.campaign.end),
                            oldestDay: moment($scope.campaign.start),
                            legend: [
                                $translate.instant('dcmhome.stats.newUsersPerDay.legend.count')
                            ]
                        };
                        $scope.chartData.newUsersPerDay = StatsService.fillAndFormatForPlot(result[0].newUsersPerDay, options);
                        $scope.currentUserCount = result[0].newUsersPerDay && result[0].newUsersPerDay[result[0].newUsersPerDay.length - 1] && result[0].newUsersPerDay[result[0].newUsersPerDay.length - 1].count;
                    });



                    StatsService.loadStats($scope.campaign.id, {type: 'newestPlans', scopeType: 'campaign', scopeId: $scope.campaign.id }).then(function (result) {
                        ActivityService.populateIdeas(result[0].newestPlans);
                        $scope.chartData.newestPlans = result[0].newestPlans;
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
                _.each(self.messages, function (message) {
                    if(message.id !== soi.id) {
                        message._editMode = false;
                    }
                });
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
        }])


        .controller('DcmEndOfCampaignController', [ '$scope', '$q', '$translate', '$rootScope', 'UserService', 'StatsService', 'ActivityService', 'AssessmentService',
            function ($scope, $q, $translate, $rootScope, UserService, StatsService, ActivityService, AssessmentService) {

                if (!$scope.campaign) {
                    return;
                }
                $scope.daysLeft = - moment().diff($scope.campaign.end, 'days');
                $scope.campaignEnded = moment().diff($scope.campaign.end) > 0;

                $scope.percetageFn = function (value) {
                    return Math.round((value || 0) *100) + '%';
                };
                $scope.roundFn = function (value) {
                    return Math.round(value);
                };
                $scope.onlyRoundFn = function (value) {
                    return Math.round(value) === value ? value : '';
                };
                $scope.round1Fn = function (value) {
                    return Math.round(value * 10) / 10;
                };


                init();

                function init() {


                    StatsService.loadStats($scope.campaign.id,
                        {
                            type: 'usersTotal',
                            scopeType: 'campaign',
                            scopeId: $scope.campaign.id
                        }).then(function (results) {
                            var res = results[0].usersTotal;

                            $scope.campaignParticipantsCount = res.usersTotal;

                            $scope.campaignParticipants = [
                                {
                                    "key": $translate.instant('dcm-end-of-campaign.usersTotal.title'),
                                    "values": [ [ $translate.instant('dcm-end-of-campaign.usersTotal.title') , res.usersTotal]  ]
                                },
                                {
                                    "key": $translate.instant('dcm-end-of-campaign.usersTotal.title'),
                                    "values": [ [ $translate.instant('dcm-end-of-campaign.usersTotal.title') , res.usersAvg]  ]
                                }
                            ];

                        });



                    function findByStatus(results, type, status) {
                        var res = results[0][type];
                        return (_.find(res, { status: status}) || {}).count || 0;
                    }
                    // eventsStatus / eventsStatusAvg
                    var eventStatus = [];
                    $q.all([


                        StatsService.loadStats($scope.campaign.id,
                            {
                                type: 'eventsStatusAvg',
                                scopeType: 'campaign',
                                scopeId: $scope.campaign.id
                            }).then(function (results) {
                                var type = 'eventsStatusAvg';
                                eventStatus.push({
                                    "key": $translate.instant('dcm-end-of-campaign.eventsStatus.campaign'),
                                    "values": [
                                        [$translate.instant('dcm-end-of-campaign.eventsStatus.done'), findByStatus(results, type, 'done')],
                                        [$translate.instant('dcm-end-of-campaign.eventsStatus.missed'), findByStatus(results, type, 'missed')],
                                        [$translate.instant('dcm-end-of-campaign.eventsStatus.open'), findByStatus(results, type, 'open')]]
                                });

                            }),
                        StatsService.loadStats($scope.campaign.id,
                            {
                                type: 'eventsStatusAvg'
                            }).then(function (results) {
                                var type = 'eventsStatusAvg';
                                eventStatus.push({
                                    "key": $translate.instant('dcm-end-of-campaign.eventsStatus.average'),
                                    "values": [
                                        [$translate.instant('dcm-end-of-campaign.eventsStatus.done'), findByStatus(results, type, 'done')],
                                        [$translate.instant('dcm-end-of-campaign.eventsStatus.missed'), findByStatus(results, type, 'missed')],
                                        [$translate.instant('dcm-end-of-campaign.eventsStatus.open'), findByStatus(results, type, 'open')]]
                                });

                            })

                    ]).then(function () {
                        $scope.eventStatus = eventStatus;
                    });

                    $q.all([
                        StatsService.getRatingsStats('campaign', $scope.campaign.id),
                        StatsService.getRatingsStats('all', $scope.campaign.id)
                    ]).then(function (results) {
                        $scope.eventsRatings = results;
                    });


                    // assessmentResults

                    $scope.displayInfo = function(question) {
                        $rootScope.$emit('healthCoach:displayMessage', AssessmentService.renderCoachMessageFromQuestion(question));
                    };

                    StatsService.loadStats($scope.campaign.id,
                        {
                            type: 'assessmentResults',
                            scopeType: 'campaign',
                            scopeId: $scope.campaign.id,
                            dontReplaceIds: 'true'
                        }).then(function (results) {
                            var type = 'assessmentResults';
                            var res = results[0][type];

                            $scope.assessmentResults = res;

                            $q.all(
                                [
                                    StatsService.loadStats($scope.campaign.id,
                                        {
                                            type: 'assessmentResults',
                                            scopeType: 'topic',
                                            scopeId: $scope.campaign.topic.id,
                                            dontReplaceIds: 'true'
                                        }).then(function (results) {
                                            var type = 'assessmentResults';
                                            var res = results[0][type];

                                            $scope.assessmentResultsAverage = res;

                                        }),
                                    AssessmentService.getAssessment($scope.campaign.topic.id || $scope.campaign.topic).then(function (assessment) {

                                        $scope.categories = _.groupBy(assessment.questions, 'category');
                                        $scope.orderedCategoryNames = _.uniq(_.map(assessment.questions, 'category'));
                                        $scope.assessment = assessment;
                                    })
                                ])

                                .then(function () {

                                    $scope.assessmentResultVisible = function (questionType, index) {
                                        if(questionType === 'leftSided') {
                                            return index <=2;
                                        } else if(questionType === 'rightSided') {
                                            return index >= 2;
                                        } else {
                                            return true;
                                        }
                                    };
                                    $scope.assessmentResultStyle = function (value, values, questionType) {

                                        var threshold = 0.05, // minimum percentage/width
                                            overflow = 0,// amount exceeding 1.0 / 100%
                                            sum = 0;

                                        _.each(values, function (val, index) {
                                            if($scope.assessmentResultVisible(questionType, index)) {
                                                sum += val;
                                                if(val < threshold) {
                                                    overflow += threshold - val;
                                                }
                                            }
                                        });
                                        var factor = sum / (sum + overflow); // factor for having 100% again
                                        var width = (value < threshold ? threshold : value) * factor * 100;
                                        return { width: width + '%' };
                                    };

                                    _.each($scope.assessmentResults.concat($scope.assessmentResultsAverage), function (result, index) {
                                        result.sum = result.veryNeg + result.neg + result.zero + result.pos + result.veryPos;
                                        var percentages = [
                                            result.veryNeg / result.sum,
                                            result.neg / result.sum,
                                            result.zero / result.sum,
                                            result.pos / result.sum,
                                            result.veryPos / result.sum
                                        ];
                                        result.percentages = [];
                                        _.each(percentages, function (val, index) {
                                            result.percentages.push(val);
                                        });
                                    });

                                    // map assessment questions to stats questions
                                    $scope.assessmentResultsByQuestion = {};
                                    _.each($scope.assessmentResults, function (assessmentResult, index) {
                                        $scope.assessmentResultsByQuestion[assessmentResult.question] = assessmentResult;
                                    });
                                    $scope.assessmentResultsAverageByQuestion = {};
                                    _.each($scope.assessmentResultsAverage, function (assessmentResult, index) {
                                        $scope.assessmentResultsAverageByQuestion[assessmentResult.question] = assessmentResult;
                                    });
                                });


                        });

                    $scope.formatValue = function (val, $index, question) {
                        return val === 1 ? ($index === 2 ? question.midtext : ($index < 2 ? question.mintext : question.maxtext)) : (Math.round(val * 100) + '%');
                    };

                    $scope.isCategoryEmpty = function (questions) {
                        return !_.any(questions, function (question) {
                            return $scope.assessmentResultsByQuestion[question.id];
                        });
                    };


                    // eventsPlanned, popular activities
                    StatsService.loadStats($scope.campaign.id,
                        {
                            type: 'eventsPlanned',
                            scopeType: 'campaign',
                            scopeId: $scope.campaign.id,
                            dontReplaceIds: 'true'
                        })
                        .then(function (results) {
                            var type = 'eventsPlanned';
                            var res = results[0][type];
                            _.each(res, function (event) {
                                event.idea = event._id;
                            });
                            return res;
                        })
                        .then(ActivityService.populateIdeas)
                        .then(function (res) {
                            $scope.eventsPlanned = res;
                        });

                }
            }
        ]);

}());