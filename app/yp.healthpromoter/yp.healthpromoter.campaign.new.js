(function () {
    'use strict';


    angular.module('yp.healthpromoter')


        .controller('CampaignCtrl', ['$scope',
            function ($scope) {

                $scope.getCssClasses = function(ngModelContoller) {
                    return {
                        error: ngModelContoller.$invalid && ngModelContoller.$dirty,
                        success: ngModelContoller.$valid && ngModelContoller.$dirty
                    };
                };

                $scope.showError = function(ngModelController, error) {
                    return ngModelController.$error[error];
                };

                $scope.canSave = function() {
                    return $scope.newCampaignForm.$dirty && $scope.newCampaignForm.$valid;
                };
            }]);


}());