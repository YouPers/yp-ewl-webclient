(function () {
    'use strict';


    angular.module('yp.dhc',
        [
            'yp.user',

            'yp.dhc.welcome',
            'yp.dhc.home',
            'yp.dhc.select',
            'yp.dhc.schedule',
            'yp.dhc.diary',
            'yp.dhc.plan',
            'yp.dhc.check',
            'ngSanitize',
            'ui.scrollfix'

//            'plan',
//            'report',
//            'dashboard',
//            'diary',
//            'goal',
//            'check'
        ]);

}());