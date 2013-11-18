(function () {
    'use strict';

    angular.module('d3.dir-line-chart', ['d3'])
        .directive('d3LineChart', ['$rootScope', '$timeout', 'd3Service', function($rootScope, $timeout, d3Service) {
            return {
                restrict: 'EA',
                scope: {
                    data: "=",
                    label: "@",
                    onClick: "&",
                    options: "="
                },
                link: function(scope, iElement, iAttrs) {

                    // watch for data changes and re-render
                    scope.$watch('data', function(newVals, oldVals) {

                        d3Service.d3().then(function(d3){

                            if (typeof newVals !== 'undefined') {
                                draw(d3, angular.fromJson(newVals));
                            }

                        });

                    }, true);

                    // on window resize, re-render d3 canvas

//                    window.onresize = function() {
//                        return scope.$apply();
//                    };

                    // Redraw the chart if the window is resized
                    $rootScope.$on('resizeMsg', function (e) {

                        d3Service.d3().then(function(d3){

                            $timeout(function () {
                                draw(d3, angular.fromJson(scope.data));
                            }, 1000);

                        });
                    });

                    function draw (d3, data) {

                        var series = data;

                        var initParameters = function () {

                            // generating defaults, if options are not set

                            scope.options = scope.options || {};

                            // scope.options.chartHeight
                            // height of chart in px
                            // - string containing a number without 'px'

                            scope.options.chartHeight = scope.options.chartHeight || "200";

                            // scope.options.chartWidth
                            // width of chart
                            // - ideally set as %-value to elastically fit into the parent container of the chart

                            scope.options.chartWidth = scope.options.chartWidth || "100%";

                            // scope.options.xScaleTopHeight
                            // height of the space containing the x scale on top of the chart

                            scope.options.yScaleLeftWidth = scope.options.yScaleLeftWidth || 85;

                            // scope.options.xScaleTopHeight
                            // height of the space containing the x scale on top of the chart

                            scope.options.xScaleTopHeight = scope.options.xScaleTopHeight || 15;

                            // scope.options.marginTop
                            // top margin of the complete chart
                            // - ideally set to a minimum of 5 to avoid cropping of x scale values on top of the chart

                            scope.options.marginTop = scope.options.marginTop || 5;

                            // scope.options.marginLeft
                            // left margin of the complete chart
                            // - ideally set to a minimum of 5 to avoid cropping of the first x scale value on top of the chart

                            scope.options.marginLeft = scope.options.marginLeft || 5;

                            // scope.options.marginBottom
                            // bottom margin of the complete chart

                            scope.options.marginBottom = scope.options.marginBottom || 10;

                            // scope.options.marginRight
                            // right margin of the complete chart

                            scope.options.marginRight = scope.options.marginRight || 10;

                            // scope.options.barMargin
                            // margin between horizontal bars

                            scope.options.barMargin = scope.options.barMargin || 5;

                        };

                        initParameters();

                        var createLineChart = function () {

                            // svgCanvas: Main container containing chartCanvas

                            // first, remove any old main containers

                            d3.select(iElement[0]).select("svg").remove();

                            var svgCanvas = d3.select(iElement[0])
                                .append("svg")
                                .attr("width", scope.options.chartWidth)
                                .attr("height", scope.options.chartHeight)
                                .attr("class", "youpers-chart");    // set class to link appropriate CSS

                            // chartCanvas: the only element stored in svgCanvas

                            var chartCanvas = svgCanvas.append("g")
                                .attr("transform", "translate(" + scope.options.marginTop + "," + scope.options.marginLeft + ")")    // top/left margin to avoid cropped elements
                                .attr("height", "100%")                 // fills the complete height of the parent container
                                .attr("width", "100%");                 // fills the complete width of the parent container

                            // segregate values from labels

                            // remove all previous items before render

                            chartCanvas.selectAll("*").remove();

                            // setup variables

                            var currentWidth,       // current width in px taking resizing into account
                                actualHeightFinal;  // height if d3-height-compress="no"

                            currentWidth = d3.select(iElement[0])[0][0].offsetWidth - (scope.options.marginLeft + scope.options.marginRight) - scope.options.yScaleLeftWidth;

                            // set the height

                            actualHeightFinal = scope.options.chartHeight - scope.options.marginTop - scope.options.xScaleTopHeight - scope.options.marginBottom;

                            // the x and y scales

//                            var x = d3.scale.linear()
//                                .domain([0, series.length])
//                                .range([0, currentWidth]);

//                            var parseDate = d3.time.format("%d.%m.%y");
//
//                            angular.forEach(series, function (entry) {
//                               entry.date = parseDate(entry.date);
//                            });

                            var x = d3.time.scale()
                                .domain([series[0].date, d3.time.day.offset(series[series.length - 1].date, 1)])
                                .range([0, currentWidth]);

                            var y = d3.scale.linear()
                                .domain([100, -100])
                                .range([0, scope.options.chartHeight - scope.options.marginTop - scope.options.marginBottom - scope.options.xScaleTopHeight]);

                            // Canvas for the top x scale

                            var xScaleTopCanvas = chartCanvas.append("g")
                                .attr("transform", "translate(" + scope.options.yScaleLeftWidth + ",0)")
                                .attr("height", scope.options.xScaleTopHeight)
                                .attr("width", "100%");

                            var yScaleLeftCanvas = chartCanvas.append("g")
                                .attr("height", "100%")
                                .attr("width", scope.options.yScaleLeftWidth);

                            yScaleLeftCanvas.append("text")
                                .attr("x", 0)
                                .attr("y", scope.options.marginTop + scope.options.xScaleTopHeight)
                                .text(scope.options.chartMaxText);

                            yScaleLeftCanvas.append("text")
                                .attr("x", 0)
                                .attr("y", scope.options.chartHeight / 2)
                                .text(scope.options.chartMidText);

                            yScaleLeftCanvas.append("text")
                                .attr("x", 0)
                                .attr("y", scope.options.chartHeight - scope.options.marginBottom)
                                .text(scope.options.chartMinText);

//                            scope.options.yScaleLeftWidth

                            // Canvas for the all elements on the chart grid

                            var gridCanvas = chartCanvas.append("g")
//                                .attr("transform", "translate(0,15)")
                                .attr("transform", "translate(" + scope.options.yScaleLeftWidth + ",15)")
                                .attr("height", "100%")
                                .attr("width", "100%");

                            // draw the x scale values

                            xScaleTopCanvas.selectAll(".rule")
                                .data(x.ticks(5))
                                .enter().append("text")
                                .attr("class", "rule")
                                .attr("x", x)
                                .attr("y", 0)
                                .attr("dy", "0.75em")
                                .attr("text-anchor", "middle")
                                .text(function (d) {
                                    return d.getDate() + "." +  (d.getMonth()+1) + ".";
//                                    return String;
                                });

                            // draw the x scale ticks

                            gridCanvas.selectAll("line")      //
                                .data(x.ticks(10))
                                .enter().append("line")
                                .attr("x1", x)
                                .attr("x2", x)
                                .attr("y1", 0)
                                .attr("y2", actualHeightFinal)
                                .style("stroke", "#ccc");

                            gridCanvas.append("g").selectAll("line")      //
                                .data(y.ticks(3))
                                .enter().append("line")
                                .attr("x1", 0)
                                .attr("x2", currentWidth)
                                .attr("y1", y)
                                .attr("y2", y)
                                .style("stroke", "#ccc");

                            gridCanvas.append("linearGradient")
                                .attr("id", "line-gradient")
                                .attr("gradientUnits", "userSpaceOnUse")
                                .attr("x1", 0).attr("y1", y(-100))
                                .attr("x2", 0).attr("y2", y(100))
                                .selectAll("stop")
                                .data([
                                    {offset: "0%", color: "#DC3912"},
                                    {offset: "12%", color: "#DC3912"},
                                    {offset: "18%", color: "#FF9900"},
                                    {offset: "33%", color: "#FF9900"},
                                    {offset: "43%", color: "#109618"},
                                    {offset: "57%", color: "#109618"},
                                    {offset: "67%", color: "#FF9900"},
                                    {offset: "82%", color: "#FF9900"},
                                    {offset: "88%", color: "#DC3912"},
                                    {offset: "100%", color: "#DC3912"}
                                ])
                                .enter().append("stop")
                                .attr("offset", function(d) { return d.offset; })
                                .attr("stop-color", function(d) { return d.color; });

                            var line = d3.svg.line()
                                .x(function(d,i) {
                                    return x(d.date);
//                                    return x(i);
                                })
                                .y(function(d) {
                                    return y(d.value);
                                });

                            //create the line

                            gridCanvas
                                .append("svg:path")
                                .attr("d", line(series))
                                .attr("class", "youpers-stress-level-line");

                        };

                        createLineChart();

                    }

                }
            };
        }])

        .run(['$rootScope','$window',function ($rootScope, $window) {
            angular.element($window).bind('resize', function () {
                $rootScope.$emit('resizeMsg');
            });
        }]);

}());
