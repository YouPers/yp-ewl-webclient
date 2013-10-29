(function () {
    'use strict';

    angular.module('d3.dir-vbar', ['d3'])
        .directive('d3VerticalBarChart', ['$rootScope', '$timeout', 'd3Service', function($rootScope, $timeout, d3Service) {
            return {
                restrict: 'EA',
                scope: {
                    data: "=",
                    label: "@",
                    onClick: "&",
                    options: "="
                },
                link: function(scope, iElement) {

                    // watch for data changes and (re-)render
                    scope.$watch('data', function(newVals) {

                        d3Service.d3().then(function(d3){

                            if (typeof newVals !== 'undefined') {
                                draw(d3, angular.fromJson(newVals));
                                scope.svgClientWidth = d3.select(iElement[0])[0][0].offsetWidth; // store new width after having drawn the new chart
                            }

                        });

                    }, true);

                    $rootScope.$watch('windowWidth', function() {
                        // Browser window width changed, so check if chart needs to be redrawn
                        d3Service.d3().then(function(d3){

                            var currentWidth = d3.select(iElement[0])[0][0].offsetWidth;

                            if (currentWidth !== 0) { // if 0, then the chart has never been drawn so far, which causes $watch('data'... to be triggered
                                    // nth time here
                                    if (scope.svgClientWidth !== currentWidth) {
                                        // width where the chart is drawn has changed, so redraw it

                                        draw(d3, angular.fromJson(scope.data));
                                        scope.svgClientWidth = d3.select(iElement[0])[0][0].offsetWidth; // store new width after having drawn the new chart

                                    }
                                }
                        });


                    }, true);

                    function draw (d3, data) {

                        var cols = data.cols;
                        var rows = data.rows;

                        var legends = [];

                        for (var l = 1; l < cols.length; l++) { // first array entry skipped on purpose
                            legends.push(cols[l].label);
                        }

                        var initParameters = function () {

                            // generating defaults, if options are not set

                            scope.options = typeof scope.options !== 'undefined' ? scope.options : {};

                            // scope.options.chartType
                            // - "grouped":
                            // - "stacked":

                            scope.options.chartType = typeof scope.options.chartType !== 'undefined' ? scope.options.chartType : "stacked";

                            // scope.options.chartHeight
                            // height of chart in px
                            // - string containing a number without 'px'
                            // - ignored if scope.options.relative is set to "yes"

                            scope.options.chartHeight = typeof scope.options.chartHeight !== 'undefined' ? scope.options.chartHeight : 150;

                            // scope.options.chartWidth
                            // width of chart
                            // - ideally set as %-value to elastically fit into the parent container of the chart

                            scope.options.chartWidth = typeof scope.options.chartWidth !== 'undefined' ? scope.options.chartWidth : "99.5%";

                            // scope.options.xScaleTopHeight
                            // height of the space containing the x scale on top of the chart

                            scope.options.xScaleBottomHeight = typeof scope.options.xScaleBottomHeight !== 'undefined' ? scope.options.xScaleBottomHeight : 15;

                            // scope.options.yScaleLeftWidth
                            // width of the space containing the y scale on the left of the chart

                            scope.options.yScaleLeftWidth = typeof scope.options.yScaleLeftWidth !== 'undefined' ? scope.options.yScaleLeftWidth : 30;

                            // scope.options.marginTop
                            // top margin of the complete chart
                            // - ideally set to a minimum of 5 to avoid cropping of x scale values on top of the chart

                            scope.options.marginTop = typeof scope.options.marginTop !== 'undefined' ? scope.options.marginTop : 10;

                            // scope.options.marginLeft
                            // left margin of the complete chart
                            // - ideally set to a minimum of 5 to avoid cropping of the first x scale value on top of the chart

                            scope.options.marginLeft = typeof scope.options.marginLeft !== 'undefined' ? scope.options.marginLeft : 5;

                            // scope.options.marginBottom
                            // bottom margin of the complete chart

                            scope.options.marginBottom = typeof scope.options.marginBottom !== 'undefined' ? scope.options.marginBottom : 10;

                            // scope.options.marginRight
                            // right margin of the complete chart

                            scope.options.marginRight = typeof scope.options.marginRight !== 'undefined' ? scope.options.marginRight : 15;

                            // scope.options.barHeight
                            // height of a horizontal bar

                            scope.options.barWidth = typeof scope.options.barWidth !== 'undefined' ? scope.options.barWidth : 30;

                            // scope.options.barMargin
                            // margin between horizontal bars

                            scope.options.barMargin = typeof scope.options.barMargin !== 'undefined' ? scope.options.barMargin : 5;

                            // scope.options.LegendWidth
                            // space (width) for the legend

                            scope.options.legendWidth = typeof scope.options.legendWidth !== 'undefined' ? scope.options.legendWidth : 86;

                            // scope.options.insetThreshold
                            // - bars smaller than this value have their value displayed outside of the bar
                            // - bars equal and larger than this value have heir value displayed inside of the bar

                            scope.options.insetThreshold = typeof scope.options.insetThreshold !== 'undefined' ? scope.options.insetThreshold : 100;

                            scope.options.actualWidthrelative = (rows.length * (scope.options.barWidth + scope.options.barMargin)) - scope.options.barMargin + scope.options.xScaleBottomHeight + scope.options.marginBottom;
                        };

                        initParameters();

                        var bumpLayer2 = function (n, o, d) {
                            var series = [];

                            for (var i = 0; i < rows.length; i++) {
                                series.push( {
                                    x : rows[i].c[0].v,
                                    y : rows[i].c[d+1].v
                                });
                            }

                            return series;

                        };

                        var timeout = setTimeout(function() {
                            d3.select("input[value=\"grouped\"]").property("checked", true).each(change);
                        }, 2000);

                        var transitionGrouped = function (y, x, yGroupMax, rect, height) {
                            y.domain([0, yGroupMax]);

                            rect.transition()
                                .duration(500)
                                .delay(function(d, i) { return i * 10; })
                                .attr("x", function(d, i, j) { return x(d.x) + x.rangeBand() / (scope.cols.length - 1) * j; })
                                .attr("width", (x.rangeBand() / (scope.cols.length - 1)))
                                .transition()
                                .attr("y", function(d) { return y(d.y); })
                                .attr("height", function(d) { return height - y(d.y); });
                        };

                        var transitionStacked = function (y, x, yStackMax, rect) {
                            y.domain([0, yStackMax]);

                            rect.transition()
                                .duration(500)
                                .delay(function(d, i) {
                                    return i * 10;
                                })
                                .attr("y", function(d) {
                                    return y(d.y0 + d.y);
                                })
                                .attr("height", function(d) {
                                    return y(d.y0) - y(d.y0 + d.y);
                                })
                                .transition()
                                .attr("x", function(d) {
                                    return x(d.x);
                                })
                                .attr("width", function() {
                                    return x.rangeBand();
                                });
                        };

                        var change = function (y, x, yGroupMax, yStackMax, rect, height) {
                            clearTimeout(timeout);
                            if (scope.options.chartType === "grouped") {
                                transitionGrouped(y, x, yGroupMax, rect, height);
                            }
                            else {
                                transitionStacked(y, x, yStackMax, rect);
                            }
                        };

                        var createBarChart = function () {

                            // svgCanvas: Main container containing chartCanvas

                            // first, remove any old main containers

                            d3.select(iElement[0]).select("svg").remove();

                            var stack = d3.layout.stack();

                            var layers = stack(d3.range(cols.length - 1).map(function(d) {
                                return bumpLayer2(rows.length, 0.1, d);
//                                return bumpLayer(rows.length, 0.1);
                            }));

                            var yGroupMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); });
                            var yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });

                            var margin = {
                                top: scope.options.marginTop,
                                right: scope.options.marginRight,
                                bottom: scope.options.marginBottom,
                                left: scope.options.marginLeft
                            };


                            var chartInnerHeight = scope.options.chartHeight - margin.top - margin.bottom - scope.options.xScaleBottomHeight;

                            var svgCanvas = d3.select(iElement[0]).append("svg")
                                .attr("width", scope.options.chartWidth)
                                .attr("height", scope.options.chartHeight)
                                .attr("class", "youpers-chart");

                            var width = d3.select(iElement[0])[0][0].offsetWidth - (scope.options.marginLeft + scope.options.marginRight + scope.options.legendWidth);

                            var xDomain = [];

                            for (var i = 0; i < rows.length; i++) {
                                xDomain.push(rows[i].c[0].v);
                            }

                            var x = d3.scale.ordinal()
                                .domain(xDomain)
//                                .domain(d3.range(rows.length))
                                .rangeRoundBands([0, width], 0.08);

                            var y = d3.scale.linear()
                                .domain([0, yStackMax])
                                .nice(10)
                                .range([chartInnerHeight, 0]);

                            var colors = ["#7f981d", "#aec71e"];

                            var color = d3.scale.linear()
                                .domain([0, (cols.length - 1) - 1])
                                .range(colors);

                            var xAxis = d3.svg.axis()
                                .scale(x)
                                .tickSize(1)
                                .tickPadding(6)
                                .orient("bottom");

                            var yAxis = d3.svg.axis()
                                .scale(y)
                                .ticks(5)
                                .tickSize(1)
                                .tickPadding(5)
                                .orient("left");

                            // Canvas for the all elements on the chart grid

                            var gridCanvas = svgCanvas.append("g")
                                .attr("transform", "translate(" + (margin.left + scope.options.yScaleLeftWidth) + "," + margin.top + ")");

                            gridCanvas.selectAll("line")
                                .data(y.ticks(5))
                                .enter().append("line")
                                .attr("x1", 0)
                                .attr("x2", width)
                                .attr("y1", y)
                                .attr("y2", y)
                                .style("stroke", "#ccc");

                            // add legend
                            var legend = gridCanvas.append("g")
                                .attr("class", "legend")
                                .attr("height", 100)
                                .attr("width", 100)
                                .attr('transform', 'translate(66,0)');

                            legend.selectAll('rect')
                                .data(legends)
                                .enter()
                                .append("rect")
                                .attr("x", width - 65)
                                .attr("y", function(d, i){
                                    return i *  20;
                                })
                                .attr("width", 10)
                                .attr("height", 10)
                                .style("fill", function(d, i) {
                                    return colors[i];
                                });

                            legend.selectAll('text')
                                .data(legends)
                                .enter()
                                .append("text")
                                .attr("class", "youpers-chart-legend")
                                .attr("x", width - 52)
                                .attr("y", function(d, i){
                                    return i *  20 + 9;
                                })
                                .text(function(d, i) {
                                    return legends[i];
                                });

                            var layer = gridCanvas.selectAll(".layer")
                                .data(layers)
                                .enter().append("g")
                                .attr("class", "layer")
                                .style("fill", function(d, i) { return color(i); });

                            var rect = layer.selectAll("rect")
                                .data(function(d) { return d; })
                                .enter().append("rect")
                                .attr("x", function(d) { return x(d.x); })
                                .attr("y", chartInnerHeight)
                                .attr("width", x.rangeBand())
                                .attr("height", 0);

                            rect.transition()
                                .delay(function(d, i) { return i * 10; })
                                .attr("y", function(d) { return y(d.y0 + d.y); })
                                .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); });

                            gridCanvas.append("g")
                                .attr("class", "x axis")
                                .attr("transform", "translate(0," + chartInnerHeight + ")")
                                .call(xAxis);

                            gridCanvas.append("g")
                                .attr("class", "y axis")
//                                .attr("transform", "translate(0," - height + ")")
                                .call(yAxis);

                            d3.selectAll("input").on("change", change(y, x, yGroupMax, yStackMax, rect, chartInnerHeight));

                        };

                        createBarChart();

                    }

                }
            };
        }])

        .run(['$rootScope','$window',function ($rootScope, $window) {
            $rootScope.windowWidth = $window.innerWidth;
            angular.element($window).bind('resize',function(){
                $rootScope.windowWidth = $window.innerWidth;
                $rootScope.$apply('windowWidth');
            });

        }]);

}());
