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
            'yp.components.i18n',

            // directives
            'yp.components.activityCard',
            'yp.components.activityEdit',
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


        .constant('enums', {
            language: [
                'de',
                'en',
                'fr',
                'it'],

            weekday: [
                'monday',
                'tuesday',
                'wednesday',
                'thursday',
                'friday',
                'saturday',
                'sunday'
            ]
        })


        .config(['$translateWtiPartialLoaderProvider', function($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('components/components');
        }])

    ;

})();