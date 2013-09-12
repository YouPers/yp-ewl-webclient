'use strict'

angular.module('yp.commons',[]).
    filter('fromNow', function() {
        return function(dateString) {
            return moment(new Date(dateString)).fromNow()
        };
    }).

    filter('fromNowFake', function() {
        return function(dateString) {
            return moment(new Date(dateString)).from(new Date(2013, 7, 20, 13, 30))
        };
    });



angular.module('yp.commons').directive('setfocus', function($timeout) {
    return {
        link: function ( scope, element, attrs ) {
            scope.$watch( attrs.setfocus, function ( val ) {
                if ( angular.isDefined( val ) && val ) {
                    $timeout( function () { element[0].focus(); } );
                }
            }, true);

            element.bind('blur', function () {
                if ( angular.isDefined( attrs.ngFocusLost ) ) {
                    scope.$apply( attrs.ngFocusLost );

                }
            });
        }
    };
});
