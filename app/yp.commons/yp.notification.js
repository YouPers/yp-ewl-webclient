(function () {
    'use strict';
    /*global printStackTrace:true */


    angular.module('yp.notification', [])

        .factory("stacktraceService", function() {

            // "printStackTrace" is a global object.
            return({ print: printStackTrace });

        })

        .config(['$provide', function ($provide) {
            $provide.decorator('$exceptionHandler', ['$delegate', 'stacktraceService', '$injector',
                function ($delegate, stacktraceService, $injector) {

                    var notificationService = null;

                    return function(exception, cause) {

                        if(!notificationService) {
                            notificationService = $injector.get('notificationService');
                        }

                        // call the original $exceptionHandler.
                        $delegate(exception, cause);

                        // log to server

                        var error = exception.toString();
                        var trace = stacktraceService.print({ e: exception });

                        notificationService.error({ error: error, trace: trace, cause: cause });
                    };
                }]);
        }])


        .run(['$rootScope', 'notificationService', '$timeout', function($rootScope, notificationService, $timeout) {

            // custom event names for error and success notifications
            $rootScope.$on('notification:error', function (event, error, options) {

                var prefix = 'notification.error.';
                var msg;


                if(typeof error === 'string') {
                    msg = error;

                    if(msg.indexOf(prefix) < 0) {
                        msg = prefix + msg;
                    }
                } else {
                    var errorCode = (error.data && error.data.code) || error.statusCode || error.status || 'default';
                    msg = prefix + errorCode;
                }


                // TODO: localize error

                $rootScope.$emit('notification', msg, _.extend(options || {}, { type: 'error', error: error }));
            });

            $rootScope.$on('notification:success', function (event, message, options) {

                var prefix = 'notification.success.';
                var msg = 'default';

                if(typeof message === 'string') {
                    msg = message;

                    if(msg.indexOf(prefix) < 0) {
                        msg = prefix + msg;
                    }
                }

                $rootScope.$emit('notification', msg, _.extend(options || {}, { type: 'success'}));

            });

            // log notification, don't show notification to user
            $rootScope.$on('notification:log', function (event, message, options) {
                $rootScope.$emit('notification', message, _.extend(options || {}, { type: 'log'}));
            });



            // clear notifications on state change
            $rootScope.$on("$stateChangeStart", function () {
//                $rootScope.notifications = [];
            });

            $rootScope.$on('notification', function (event, message, options) {

                var defaults = {
                    id: _.uniqueId(),
                    message: message,
                    values: {},

                    type: 'info',
                    duration: 3000
                };

                // map log level types to alert types
                var typeMap = {
                    info: 'info',
                    debug: 'info',
                    success: 'success', // not available as log level, fallback to info
                    warn: 'warning',
                    error: 'danger'
                };

                var opts = _.clone(defaults);
                _.merge(opts, options);


                // log notification
                notificationService.notification(opts.type)(message, options);

                if(opts.type === 'log') {
                    return false; // skip user feedback below
                }

                // display notification

                opts.alertType = typeMap[opts.type] || 'info';

                $rootScope.notifications = $rootScope.notifications || [];

                if($rootScope.notifications.length > 0 && $rootScope.notifications[0].message ===
                    opts.message) {
                    return false; // don't repeat the same message
                }

                // display new notification on top
                $rootScope.notifications.unshift(opts);

                if (opts.duration) {
                    $timeout(function () {
                        _.remove($rootScope.notifications, function(n) {
                            return n.id === opts.id;
                        });
                    }, opts.duration);
                }

            });


            $rootScope.closeNotification = function (id) {
                _.remove($rootScope.notifications, function(n) { return n.id === id; });
            };
        }])

        .factory("notificationService", [ '$log', '$window', 'Restangular', function( $log, $window, Restangular) {




            var errorResource = Restangular.all('error');

            var notificationFn = function(type) {

                var fn = function () {

                    type = type || 'log';
                    if(!_.contains(['log', 'debug', 'info', 'warn', 'error'], type)) {
                        type = 'info';
                    }



                    var client = {
                        location: $window.location.href,
                        userAgent: navigator.userAgent
                    };

                    if(typeof arguments[1] === 'object') {
                        var error = arguments[1].error || arguments[1];
                        client.headers = error.headers();
                        client.requestId = client.headers['request-id'];

                        if(error.data) {
                            client.error = error.data;
                        }
                        $log[type].apply( $log, [client.requestId, client.location, client.error] );

                    }


                    // log to console

                    $log[type].apply( $log, arguments );


                    var args = {
                        error: arguments,
                        client: client
                    };

                    if(_.contains(['warn', 'error'], type)) {


                        errorResource.post(args);
                    }

                };

                return fn;
            };

            return {

                notification: notificationFn,
                log: notificationFn('log'),
                debug: notificationFn('debug'),
                info: notificationFn('info'),
                warn: notificationFn('warn'),
                error: notificationFn('error')
            };
        }]);

}());