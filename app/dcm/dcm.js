(function () {
    'use strict';


    angular.module('yp.dcm',
        [
            'yp.user',

            'yp.dcm.home',
            'yp.dcm.organization',
            'yp.dcm.campaign',
            'yp.dcm.schedule',
            'yp.dcm.notification',
            'yp.dcm.stats',

            'yp.dcm.activity',

            'ngSanitize',
            'ui.scrollfix'
        ]);

}());