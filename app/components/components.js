(function () {
    'use strict';

    angular.module('yp.components', [

            'yp.components.activity',
            'yp.components.assessment',
            'yp.components.organization',
            'yp.components.campaign',

            'yp.components.notifications',


            // components with a distinct namespace, needed to fix dependency issues where one component in 'yp.components'
            // references another one in the same namespace
            // TODO: decide if we should all place all components in a distinct namespace
            'yp.components.campaign-switcher'


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
    ;

})();