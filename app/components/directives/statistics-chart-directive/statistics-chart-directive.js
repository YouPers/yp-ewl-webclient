(function () {

    'use strict';

    angular.module('yp.components.statisticsChart', [])
        .directive('statisticsChart', [function () {
            return {
                restrict: 'EA',
                scope: {
                    data: '='
                },
                templateUrl: 'components/directives/statistics-chart-directive/statistics-chart-directive.html',

                link: function (scope, elem, attrs) {

                    if(!attrs.data) {
                        throw new Error('data attribute is required');
                    }

                    var config = {
                        title: '',
                        tooltips: true,
                        labels: false,
                        mouseover: function() {},
                        mouseout: function() {},
                        click: function() {},
                        legend: {
                            display: true,
                            //could be 'left, right'
                            position: 'left'
                        },
                        innerRadius: 0, // applicable on pieCharts, can be a percentage like '50%'
                        lineLegend: 'lineEnd' // can be also 'traditional'
                    };

                }
            };
        }]);

}());