(function () {

    'use strict';

    angular.module('yp.components.statisticsChart', ['angularCharts'])

    /**
     * statistics-chart directive: standard directive for displaying a line chart, supports multiple data sets / lines
     *
     * chartData:
     *
     * "series": [
     *      "legend1",
     *      "legend2"
     * ],
     * "data": [
     *
     *      {
     *          "x": x-value
     *          "y": [y-value1, y-value2]
     *      },
     *      {
     *          "x": x-value
     *          "y": [y-value1, y-value2]
     *      }
     * ]
     *
     * title: chart title
     *
     *
     */

        .directive('statisticsChart', [function () {
            return {
                restrict: 'EA',
                scope: {
                    chartData: '=',
                    title: '='
                },
                templateUrl: 'components/directives/statistics-chart-directive/statistics-chart-directive.html',

                link: function (scope, elem, attrs) {

                    if(!attrs.chartData) {
                        throw new Error('chartData attribute is required');
                    }

                    scope.config = {
                        title: scope.title,
                        tooltips: true,
                        labels: false,
                        mouseover: function() {},
                        mouseout: function() {},
                        click: function() {},
                        legend: {
                            display: false,
                            //could be 'left, right'
                            position: 'right'
                        },
                        lineLegend: false
                    };

                }
            };
        }]);

}());