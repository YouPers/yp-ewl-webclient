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

            // directives
            'yp.components.userInvitation',
            'yp.components.activityEventStack',
            'yp.components.gameArea',
            'yp.components.gameAreaSidePanel',
            'yp.components.ideaCard',
            'yp.components.ideaThumbnail',
            'yp.components.ideaEdit',
            'yp.components.avatarUpload',
            'yp.components.campaignSwitcher',
            'yp.components.datePicker',
            'yp.components.dateTimePicker',
            'yp.components.multipleViewCarousel',
            'yp.components.recommendedBySlider',
            'yp.components.scheduledDate',
            'yp.components.ypInput',
            'yp.components.statisticsChart'
        ])

        .run(['$rootScope', function ($rootScope) {
            $rootScope.enums = {
                language: [
                    'de',
                    'en',
                    'fr',
                    'it']

            };
        }])

        .config(['$translateWtiPartialLoaderProvider', function($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('components/components');
        }])

    ;

})();