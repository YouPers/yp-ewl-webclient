'use strict';

/* jasmine specs for services go here */
beforeEach(angular.mock.module('yp.components'));

describe('yp-common: ', function () {

    describe('i18n: ', function () {
        var $scope = null;
        var ctrl = null;

        beforeEach(module('yp.components.i18n'));
        beforeEach(module('yp.components.activity'));
        beforeEach(module('yp.components.assessment'));

        /* IMPORTANT!
         * this is where we're setting up the $scope and
         * calling the controller function on it, injecting
         * all the important bits, like our mockService */
        beforeEach(inject(function ($rootScope, $controller, $http) {

            //create a scope object for us to use.
            $scope = $rootScope.$new();

            //now run that scope through the controller function,
            //injecting any services or other injectables we need.
            ctrl = $controller('i18nCtrl', {
                $scope: $scope
            });
        }));

        describe('set language', function () {
            it('should set correct language', inject(function ($translate) {
                expect(ctrl).toBeDefined();
                $scope.changeLang('DE');
                expect($translate.use()).toEqual('DE');
                $scope.changeLang('EN');
                expect($translate.use()).toEqual('EN');
            }));
        });
    });
});
