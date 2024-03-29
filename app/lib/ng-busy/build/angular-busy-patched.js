/*** An AngularJS module for reacting to when your app is busy.
* @author Mike Grabski <me@mikegrabski.com>
* @version v0.2.0
* @link https://github.com/HackedByChinese/ng-busy.git
* @license MIT
*/
(function (window, angular, undefined) {
	'use strict';

	// RBLU: WL-1469: removed the whole http interceptor here, the automatic relationship  "a running http-call === we are busy" is
	// not good enough, so we manage busy / not busy manually by sending the events in our code.

	// minimal: <button busy="Loading..." />
    // complete: <button busy="Loading..." busy-when-url="string" busy-when-name="string" busy-add-classes="string" busy-remove-classes="string" busy-disabled="bool" not-busy-when-url="string" not-busy-when-name="string" not-busy-add-classes="string" not-busy-remove-classes="string" not-busy-disabled="bool" />

	angular.module('ngBusy.busy', [])
		.directive('busy', ['$parse', '$timeout', function($parse, $timeout) {
			return {
				restrict: 'A',
				tranclude:true,
				scope: {},
				controller: ['$scope', function($scope) {
					this.setBusyMessageElement = function(element) {
						$scope.busyMessageElement = element;
					}
				}],
				link: function(scope, element, attrs) {
					attrs.$observe('busy', function(val) {
						scope.busyMessage = val;
					});

					attrs.$observe('busyWhenUrl', function(val) {
						scope.busyWhenUrl = val;
					});
					attrs.$observe('busyWhenName', function(val) {
						scope.busyWhenName = val;
					});
					attrs.$observe('busyAddClasses', function(val) {
						scope.busyAddClasses = val;
					});
					attrs.$observe('busyRemoveClasses', function(val) {
						scope.busyRemoveClasses = val;
					});
					attrs.$observe('busyDisabled', function(val) {
						var parsed = $parse(val)(scope);
						scope.busyDisabled = angular.isDefined(parsed) ? parsed : true;
					});

					attrs.$observe('notBusyWhenUrl', function(val) {
						scope.notBusyWhenUrl = val;
					});
					attrs.$observe('notBusyWhenName', function(val) {
						scope.notBusyWhenName = val;
					});
					attrs.$observe('notBusyAddClasses', function(val) {
						scope.notBusyAddClasses = val;
					});
					attrs.$observe('notBusyRemoveClasses', function(val) {
						scope.notBusyRemoveClasses = val;
					});
					attrs.$observe('notBusyDisabled', function(val) {
						var parsed = $parse(val)(scope);
						scope.notBusyDisabled = angular.isDefined(parsed) ? parsed : false;
					});

					scope.isBusyFor = function(config, begin) {
						var key;
						if (scope[(key = begin ? 'busyWhenName' : 'notBusyWhenName')]) return !!config.name && !!config.name.match(scope[key]);
						else if (scope[(key = begin ? 'busyWhenUrl' : 'notBusyWhenUrl')]) return !!config.url && !!config.url.match(scope[key]);
						else return begin === true || config.remaining <= 0;
					};

					scope.$on('busy.begin', function(evt, config) {
						if (!scope.busy && scope.isBusyFor(config, true)) {
							scope.originalContent = element.html();
							if (scope.busyDisabled) $timeout(function() {element.attr('disabled', true);});
							var msgElement = scope.busyMessageElement ? scope.busyMessageElement.clone() : null;
							if (msgElement || scope.busyMessage) element.html('').append(msgElement || scope.busyMessage);

							element.removeClass(scope.busyRemoveClasses).addClass(scope.busyAddClasses);

							scope.busy = true;
						}
					});

					scope.$on('busy.end', function(evt, config) {
						if (scope.busy && scope.isBusyFor(config)) {
							if (scope.originalContent) element.html(scope.originalContent);
							element.attr('disabled', scope.notBusyDisabled===true);

							element.removeClass(scope.notBusyRemoveClasses).addClass(scope.notBusyAddClasses);

							scope.busy = false;
						}
					});
				}
			}
		}])
		.directive('busyMessage', function() {
			return {
				restrict: 'AE',
				transclude: true,
				require: '^busy',
				template: '',
				replace: true,
				compile: function(element, attr, transclude) {
					// we're basically going to transclude the content, strip it, and set the busy message as the resulting transcluded HTML via the controller setBusyMessageElement function
					return function link(scope, element, attr, busyCtrl) {
						busyCtrl.setBusyMessageElement(transclude(scope, function() {}));
					}
				}
			}
		});

	angular.module('ngBusy', ['ngBusy.busy']);
})(window, window.angular);
