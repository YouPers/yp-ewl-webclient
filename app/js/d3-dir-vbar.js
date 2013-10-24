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

                        var series = data.series;

                        var initParameters = function () {

                            // generating defaults, if options are not set

                            scope.options = typeof scope.options !== 'undefined' ? scope.options : {};

                            // scope.options.compressed
                            // - "yes": calculate height based on number of bars and other parameters -> best fit of a chart
                            // - "no": value of scope.options.chartHeight is taken

                            scope.options.compressed = typeof scope.options.compressed !== 'undefined' ? scope.options.compressed : "yes";

                            // scope.options.chartHeight
                            // height of chart in px
                            // - string containing a number without 'px'
                            // - ignored if scope.options.compressed is set to "yes"

                            scope.options.chartHeight = typeof scope.options.chartHeight !== 'undefined' ? scope.options.chartHeight : "200";

                            // scope.options.chartWidth
                            // width of chart
                            // - ideally set as %-value to elastically fit into the parent container of the chart

                            scope.options.chartWidth = typeof scope.options.chartWidth !== 'undefined' ? scope.options.chartWidth : "100%";

                            // scope.options.xScaleTopHeight
                            // height of the space containing the x scale on top of the chart

                            scope.options.xScaleTopHeight = typeof scope.options.xScaleTopHeight !== 'undefined' ? scope.options.xScaleTopHeight : 15;

                            // scope.options.marginTop
                            // top margin of the complete chart
                            // - ideally set to a minimum of 5 to avoid cropping of x scale values on top of the chart

                            scope.options.marginTop = typeof scope.options.marginTop !== 'undefined' ? scope.options.marginTop : 5;

                            // scope.options.marginLeft
                            // left margin of the complete chart
                            // - ideally set to a minimum of 5 to avoid cropping of the first x scale value on top of the chart

                            scope.options.marginLeft = typeof scope.options.marginLeft !== 'undefined' ? scope.options.marginLeft : 5;

                            // scope.options.marginBottom
                            // bottom margin of the complete chart

                            scope.options.marginBottom = typeof scope.options.marginBottom !== 'undefined' ? scope.options.marginBottom : 10;

                            // scope.options.marginRight
                            // right margin of the complete chart

                            scope.options.marginRight = typeof scope.options.marginRight !== 'undefined' ? scope.options.marginRight : 10;

                            // scope.options.barHeight
                            // height of a horizontal bar

                            scope.options.barHeight = typeof scope.options.barHeight !== 'undefined' ? scope.options.barHeight : 30;

                            // scope.options.barMargin
                            // margin between horizontal bars

                            scope.options.barMargin = typeof scope.options.barMargin !== 'undefined' ? scope.options.barMargin : 5;

                            // scope.options.insetThreshold
                            // - bars smaller than this value have their value displayed outside of the bar
                            // - bars equal and larger than this value have heir value displayed inside of the bar

                            scope.options.insetThreshold = typeof scope.options.insetThreshold !== 'undefined' ? scope.options.insetThreshold : 100;

                            scope.options.actualHeightCompressed = (series.length * (scope.options.barHeight + scope.options.barMargin)) - scope.options.barMargin + scope.options.xScaleTopHeight + scope.options.marginBottom;
                        };

                        initParameters();

                        var createBarChart = function () {

                            // svgCanvas: Main container containing chartCanvas

                            // first, remove any old main containers

                            d3.select(iElement[0]).select("svg").remove();

                            var svgCanvas = d3.select(iElement[0])
                                .append("svg")
                                .attr("width", scope.options.chartWidth)
                                .attr("height", scope.options.chartHeight)
                                .attr("class", "youpers-chart");    // set class to link appropriate CSS

                            if (scope.options.compressed === "yes") {  //
                                svgCanvas.attr('height', scope.options.actualHeightCompressed);
                            }

                            // chartCanvas: the only element stored in svgCanvas

                            var chartCanvas = svgCanvas.append("g")
                                .attr("transform", "translate(" + scope.options.marginTop + "," + scope.options.marginLeft + ")")    // top/left margin to avoid cropped elements
                                .attr("height", "100%")                 // fills the complete height of the parent container
                                .attr("width", "100%");                 // fills the complete width of the parent container

                            // segregate values from labels

                            var labels = [];
                            var values = [];

                            for (var i = 0; i < series.length; i++) {
                                labels.push(series[i].label);
                                values.push(series[i].value);
                            }

                            // remove all previous items before render

                            chartCanvas.selectAll("*").remove();

                            // setup variables

                            var currentWidth,       // current width in px taking resizing into account
                                actualHeightFinal;  // height if d3-height-compress="no"

                            currentWidth = d3.select(iElement[0])[0][0].offsetWidth - (scope.options.marginLeft + scope.options.marginRight);
                            scope.options.actualHeightCompressed = (series.length * (scope.options.barHeight + scope.options.barMargin)) - scope.options.barMargin;
//                            maxValue = d3.max(data, function (d) { return d.value;});

                            // set the height

                            if (scope.options.compressed === "yes") {
                                actualHeightFinal = scope.options.actualHeightCompressed;
                                chartCanvas.attr('height', scope.options.actualHeightCompressed);
                            } else {
                                actualHeightFinal = scope.options.chartHeight - scope.options.marginTop - scope.options.xScaleTopHeight - (scope.options.marginBottom / 2);
                                scope.options.barHeight = (scope.options.barHeight * scope.options.chartHeight / scope.options.actualHeightCompressed);
                                scope.options.barHeight = ((actualHeightFinal + scope.options.barMargin) / series.length) - scope.options.barMargin;
                            }

                            // the x and y scales

                            var x = d3.scale.linear()
                                .domain([0, d3.max(values)])
                                .range([0, currentWidth]);

//                            var y = d3.scale.ordinal()
//                                .domain(d3.range(series.length))
//                                .rangeRoundBands([0, actualHeightFinal], (scope.options.barMargin / scope.options.barHeight), (scope.options.marginTop / scope.options.barHeight));
//                                .rangeBands([0, actualHeightFinal]);

                            // Canvas for the top x scale

                            var xScaleTopCanvas = chartCanvas.append("g")
                                .attr("height", scope.options.xScaleTopHeight)
                                .attr("width", "100%");

                            // Canvas for the all elements on the chart grid

                            var gridCanvas = chartCanvas.append("g")
                                .attr("transform", "translate(0,15)")
                                .attr("height", "100%")
                                .attr("width", "100%");

                            // draw the x scale values

                            xScaleTopCanvas.selectAll(".rule")
                                .data(x.ticks(10))
                                .enter().append("text")
                                .attr("class", "rule")
                                .attr("x", x)
                                .attr("y", 0)
                                .attr("dy", "0.75em")
                                .attr("text-anchor", "middle")
                                .text(String);

                            // draw the x scale ticks

                            gridCanvas.selectAll("line")      //
                                .data(x.ticks(10))
                                .enter().append("line")
                                .attr("x1", x)
                                .attr("x2", x)
                                .attr("y1", 0)
                                .attr("y2", actualHeightFinal)
                                .style("stroke", "#ccc");

                            //create the rectangles for the bar chart

                            gridCanvas.selectAll("rect")
                                .data(values)
                                .enter()
                                .append("rect")
                                .on("click", function(d, i) {
                                    return scope.onClick({item: d});
                                })
                                .attr("class", function(d, i) {
                                    return i % 2 ? "youpers-chart-even" : "youpers-chart-uneven";
                                })
                                .attr("height", scope.options.barHeight)  // height of each bar
                                .attr("width", 0)           // initial width of 0 for transition
                                .attr("x", 0)
                                .attr('y', function(d,i) {
                                    return i * (scope.options.barHeight + scope.options.barMargin);
                                })
                                .transition()
                                .duration(1000)             // time of duration
                                .attr("width", function(d) {
                                    if (x(d) > 0) {
                                        return x(d);
                                    } else {
                                        return 0;
                                    }
                                })
                            ;

                            gridCanvas.selectAll("label")
                                .data(labels)
                                .enter()
                                .append("text")
                                .attr("y", function(d,i) {
                                    return i * (scope.options.barHeight + scope.options.barMargin);
                                })
                                .attr("dy", "1.35em")
//                                .attr("x", 5)
                                .attr("x", function (d,i) {
                                    var xPos = 5; // starting x position
                                    if (x(values[i]) < scope.options.insetThreshold) {
                                        if (x(values[i]) < 20) {
                                            return xPos + x(values[i]) + 20;
                                        } else {
                                            return xPos + x(values[i]);
                                        }
                                    } else {
                                        return xPos;
                                    }
                                })
                                .attr("class", "youpers-chart-label")
                                .style("fill", function (d,i) {
                                    if (x(values[i]) < scope.options.insetThreshold) {
                                        return "#000";
                                    } else {
                                        return "#fff";
                                    }
                                })
                                .text(function(d) {
                                    return d;
                                });

                            gridCanvas.selectAll("value")
                                .data(values)
                                .enter()
                                .append("text")
                                .attr("y", function(d,i) {
                                    return i * (scope.options.barHeight + scope.options.barMargin);
                                })
                                .attr("dy", "1.35em")
                                .attr("x", function (d,i) {
                                    var xPos = x(d); // x starting position
                                    if (x(d) < 20) {
                                        return xPos + 15;
                                    } else {
                                        return xPos - 5;
                                    }
                                })
                                .attr("text-anchor", "end")
                                .attr("class", "youpers-chart-value")
                                .style("fill", function (d,i) {
                                    if (x(d) < 20) {
                                        return "#000";
                                    } else {
                                        return "#fff";
                                    }
                                })
                                .text(function(d) {
                                    return d.toString();
                                });

                            gridCanvas.append("line")
                                .attr("y1", 0)
                                .attr("y2", actualHeightFinal)
                                .style("stroke", "#000");

                        };

                        createBarChart();

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
