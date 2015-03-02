(function () {
    'use strict';
    /*global printStackTrace:true */



    angular.module('yp.components.util.clientMessage', [])

    /**
     * stacktrace.js - print stacktraces from exceptions
     */
        .factory("StacktraceService", function() {

            // "printStackTrace" is a global object.
            return({ print: printStackTrace });

        })

    /**
     * decorate exceptionHandler, log uncaught exceptions to backend
     */
        .config(['$provide', function ($provide) {
            $provide.decorator('$exceptionHandler', ['$delegate', 'StacktraceService', '$injector',
                function ($delegate, StacktraceService, $injector) {

                    var ClientMessageService = null;

                    return function(exception, cause) {

                        if(!ClientMessageService) {
                            ClientMessageService = $injector.get('ClientMessageService');
                        }

                        // call the original $exceptionHandler.
                        $delegate(exception, cause);

                        // log to server

                        var error = exception.toString();
                        var trace = StacktraceService.print({ e: exception });

                        ClientMessageService.error({ error: error, trace: trace, cause: cause });
                    };
                }]);
        }])


        .run(['$rootScope', 'ClientMessageService', '$timeout', function($rootScope, ClientMessageService, $timeout) {



            // distinct event name for error notifications
            $rootScope.$on('clientmsg:error', function (event, error, options) {

                var prefix = 'clientmsg.error.';
                var msg;


                if(typeof error === 'string') {
                    msg = error;
                    error = options && options.error ? options.error : error;

                    if(msg.indexOf(prefix) < 0) {
                        msg = prefix + msg;
                    }
                } else {
                    var errorCode = (error.data && error.data.code) || error.statusCode || error.status || 'default';
                    msg = prefix + errorCode;
                }


                // TODO: localize error

                options = options || {};
                options.type = options.type || 'error';

                $rootScope.$emit('clientmsg', msg, _.extend(options, { error: error }));
            });

            // distinct event name for success notifications
            $rootScope.$on('clientmsg:success', function (event, message, options) {

                var prefix = 'clientmsg.success.';
                var msg = 'default';

                if(typeof message === 'string') {
                    msg = message;

                    if(msg.indexOf(prefix) < 0) {
                        msg = prefix + msg;
                    }
                }

                $rootScope.$emit('clientmsg', msg, _.extend(options || {}, { type: 'success'}));

            });

            // distinct event name for log notifications, logging only without user feedback
            $rootScope.$on('clientmsg:log', function (event, message, options) {
                $rootScope.$emit('clientmsg', message, _.extend(options || {}, { type: 'log'}));
            });

            // clear list of notifications on state change
            $rootScope.$on("$stateChangeStart", function () {
//                $rootScope.notifications = [];
            });

            $rootScope.$on('clientmsg', function (event, message, options) {
                console.log('clientMsg');
                console.log(message);
                console.log(options);
                var defaults = {
                    id: _.uniqueId(),
                    message: message,
                    values: {},

                    type: 'info',
                    duration: 5000
                };

                // map log level types to alert types
                var typeMap = {
                    info: 'info',
                    debug: 'info',
                    success: 'success', // not available as log level, fallback to info
                    warn: 'warning',
                    error: 'danger'
                };

                var opts = _.clone(defaults, true);
                _.merge(opts, options);


                // log notification
                var parsedError = ClientMessageService.clientmsg(opts.type)(message, options);

                if (parsedError.backendNotRunning && !parsedError.maintenanceMode) {
                    opts.message = 'clientmsg.error.502';
                    opts.type = 'error';
                }

                if (parsedError.maintenanceMode) {
                    opts.type = 'error';
                }

                // we do not want to bother the user with warnings, only show errors and successes
                if(opts.type !== 'error' && opts.type !== 'success') {
                    return false; // skip user feedback below
                }

                // display notification

                opts.alertType = typeMap[opts.type] || 'info';

                $rootScope.clientmsgs = $rootScope.clientmsgs || [];

                if($rootScope.clientmsgs.length > 0 && $rootScope.clientmsgs[0].message ===
                    opts.message) {
                    return false; // don't repeat the same message
                }

                // display new notification on top
                $rootScope.clientmsgs.unshift(opts);

                if (opts.duration) {
                    $timeout(function () {
                        _.remove($rootScope.clientmsgs, function(n) {
                            return n.id === opts.id;
                        });
                    }, opts.duration);
                }

            });


            $rootScope.closeClientmsg = function (id) {
                _.remove($rootScope.clientmsgs, function(n) { return n.id === id; });
            };
        }])

        .factory("ClientMessageService", [ '$log', '$window', 'Restangular', function( $log, $window, Restangular) {

            var errorResource = Restangular.all('error');

            var backendErrorCount = 0;

            var _postToBackend = _.throttle(function(args) {
                backendErrorCount++;
                if (backendErrorCount < 10 ) {
                    errorResource.post(args);
                } else if (backendErrorCount === 10) {
                    console.error("Stopped logging to the backend, we already logged the max of 10 errors from this client session");
                }
            }, 10000);


            var clientmsgFn = function(type) {

                var fn = function () {

                    type = type || 'log';
                    if(!_.contains(['log', 'debug', 'info', 'warn', 'error'], type)) {
                        type = 'info';
                    }

                    // gather client and response info
                    var client = {
                        location: $window.location.href,
                        userAgent: navigator.userAgent
                    };


                    if(typeof arguments[1] === 'object') {
                        var error = arguments[1].error || arguments[1];
                        if(error.headers) {
                            client.headers = error.headers();
                            client.requestId = client.headers['request-id'];
                        }

                        if(error.data) {
                            client.error = error.data;
                        }
                        $log[type].apply( $log, [client.requestId, client.location, client.error] );


                        // depending whether are on a proxied setup or without proxy the error we get for an unreachable
                        // backend is very different.

                        // local only node.js: down/unreachable or proxied setup: nginx down/unreachable
                        // no answer at all from the backend
                        client.backendNotReachableAtAll = error.status === 0 && (error.config && error.config.url);
                        client.backendNotRunningBehindNginx = error.status === 502 || error.status === 504;
                        client.maintenanceMode = error.status === 503;
                        client.backendNotRunning = client.backendNotReachableAtAll || client.backendNotRunningBehindNginx || client.maintenanceMode;

                        // we identify whether this was caused by the backend by checking whether we have already a
                        // request-id because the backend assigns each request a unique 'request-id'
                        client.isCausedByBackendError = client.headers && client.headers['request-id'];
                    }


                    // log to console

                    $log[type].apply( $log, arguments );

                    // post to backend if it is of type 'error' and it the error was not already caused by the backend
                    // and we don't have a backendNotRunning Error.
                    if(_.contains(['error'], type) && !client.isCausedByBackendError && !client.backendNotRunning) {
                        var args = {
                            error: arguments,
                            client: client
                        };

                        _postToBackend(args);

                    }

                    return client;

                };

                return fn;
            };

            return {

                clientmsg: clientmsgFn,
                log: clientmsgFn('log'),
                debug: clientmsgFn('debug'),
                info: clientmsgFn('info'),
                warn: clientmsgFn('warn'),
                error: clientmsgFn('error')
            };
        }]);

}());