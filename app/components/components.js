(function () {
    'use strict';

    angular.module('yp.components', [

            'pascalprecht.translate',

            'yp.components.util',

            'yp.components.user',

            'yp.components.activity',
            'yp.components.assessment',
            'yp.components.organization',
            'yp.components.campaign',
            'yp.components.notifications',
            'yp.components.healthCoach',
            'yp.components.feedback',
            'yp.components.socialInteraction',
            'yp.components.message',
            'yp.components.i18n',
            'yp.components.stats',

            // directives
            'yp.components.userInvitation',
            'yp.components.emailInvitation',
            'yp.components.activityComments',
            'yp.components.activityEventStack',
            'yp.components.activityEventCard',
            'yp.components.activityOfferCard',
            'yp.components.gameArea',
            'yp.components.gameAreaSidePanel',
            'yp.components.ideaCard',
            'yp.components.ideaEdit',
            'yp.components.avatarUpload',
            'yp.components.campaignSwitcher',
            'yp.components.campaignCard',
            'yp.components.organizationCard',
            'yp.components.datePicker',
            'yp.components.ypInput',
            'yp.components.statisticsChart'

//        'yp.components.multipleViewCarousel',

    ])

        .run(['$rootScope', function ($rootScope) {
            $rootScope.enums = {
                language: [
                    'de',
                    'en',
                    'fr',
                    'it'
                ]
            };
        }])

        .config(['$translateWtiPartialLoaderProvider', function($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('components/components');
        }]);

})();