(function () {
    'use strict';

    angular.module('d3.directives', ['d3'])
        .directive('d3HorizontalBarChart', ['d3Service', function(d3Service) {
            return {
                restrict: 'EA',
                scope: {
                    data: "=",
                    label: "@",
                    onClick: "&",
                    options: "="
                },
                link: function(scope, iElement, iAttrs) {
                    d3Service.d3().then(function(d3){

                        var d3Options = {};

                        // generating defaults, if options are not set

                        if (typeof scope.options === 'undefined') {
                        } else {
                            d3Options = scope.options;
                        }

                        // d3Options.compressed
                        // - "yes": calculate height based on number of bars and other parameters -> best fit of a chart
                        // - "no": value of d3Options.chartHeight is taken

                        if (typeof d3Options.compressed === 'undefined') {
                            d3Options.compressed = "yes";
                        }

                        // d3Options.chartHeight
                        // height of chart in px
                        // - string containing a number without 'px'
                        // - ignored if d3Options.compressed is set to "yes"

                        if (typeof d3Options.chartHeight === 'undefined') {
                            d3Options.chartHeight = "200";
                        }

                        // d3Options.chartWidth
                        // width of chart
                        // - ideally set as %-value to elastically fit into the parent container of the chart

                        if (typeof d3Options.chartWidth === 'undefined') {
                            d3Options.chartWidth = "100%";
                        }

                        // d3Options.xScaleTopHeight
                        // height of the space containing the x scale on top of the chart

                        if (typeof d3Options.xScaleTopHeight === 'undefined') {
                            d3Options.xScaleTopHeight = 15;
                        }

                        // d3Options.marginTop
                        // top margin of the complete chart
                        // - ideally set to a minimum of 5 to avoid cropping of x scale values on top of the chart

                        if (typeof d3Options.marginTop === 'undefined') {
                            d3Options.marginTop = 5;
                        }

                        // d3Options.marginLeft
                        // left margin of the complete chart
                        // - ideally set to a minimum of 5 to avoid cropping of the first x scale value on top of the chart

                        if (typeof d3Options.marginLeft === 'undefined') {
                            d3Options.marginLeft = 5;
                        }

                        // d3Options.marginBottom
                        // bottom margin of the complete chart

                        if (typeof d3Options.marginBottom === 'undefined') {
                            d3Options.marginBottom = 10;
                        }

                        // d3Options.marginRight
                        // right margin of the complete chart

                        if (typeof d3Options.marginRight === 'undefined') {
                            d3Options.marginRight = 10;
                        }

                        // d3Options.barHeight
                        // height of a horizontal bar

                        if (typeof d3Options.barHeight === 'undefined') {
                            d3Options.barHeight = 30;
                        }

                        // d3Options.barMargin
                        // margin between horizontal bars

                        if (typeof d3Options.barMargin === 'undefined') {
                            d3Options.barMargin = 5;
                        }

                        // d3Options.insetThreshold
                        // - bars smaller than this value have their value displayed outside of the bar
                        // - bars equal and larger than this value have heir value displayed inside of the bar

                        if (typeof d3Options.insetThreshold === 'undefined') {
                            d3Options.insetThreshold = 200;
                        }

                        var series = scope.data.series;

                        var actualHeightCompressed = (series.length * (d3Options.barHeight + d3Options.barMargin)) - d3Options.barMargin + d3Options.xScaleTopHeight + d3Options.marginBottom;

                        // svgCanvas: Container with n g-containers
                        // only chartCanvas is stored in this container

                        var svgCanvas = d3.select(iElement[0])
                            .append("svg")
                            .attr("width", d3Options.chartWidth)        // width as set in the <d3-bars width=...
                            .attr("height", d3Options.chartHeight)      // height as set in the <d3-bars height=...
                            .attr("class", "youpers-chart");    // set class to link appropriate CSS

                        if (d3Options.compressed === "yes") {  //
                            svgCanvas.attr('height', actualHeightCompressed);
                        }

                        // chartCanvas: the only element stored in svgCanvas

                        var chartCanvas = svgCanvas.append("g")
                            .attr("transform", "translate(" + d3Options.marginTop + "," + d3Options.marginLeft + ")")    // top/left margin to avoid cropped elements
                            .attr("height", "100%")                 // fills the complete height of the parent container
                            .attr("width", "100%");                 // fills the complete width of the parent container

                        // on window resize, re-render d3 canvas

                        window.onresize = function() {
                            return scope.$apply();
                        };

                        scope.$watch(function(){
                                return angular.element(window)[0].innerWidth;
                            }, function(){
                                return scope.render(scope.data);
                            }
                        );

                        // watch for data changes and re-render
                        scope.$watch('data', function(newVals, oldVals) {
                            // remark: values passed with 'value=" {{ angular expression }} " are handed over as JSON strings
                            //         in order to convert JSON string back to an object, array, etc., it needs to be
                            //         converted by using angular.fromJSON( JSON String );
                            return scope.render(angular.fromJson(newVals));
                        }, true);

                        // define render function
                        scope.render = function(data){

//                            var fuck = angular.fromJson(data);

                            var series = data.series;

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

                            currentWidth = d3.select(iElement[0])[0][0].offsetWidth - (d3Options.marginLeft + d3Options.marginRight);
                            actualHeightCompressed = (series.length * (d3Options.barHeight + d3Options.barMargin)) - d3Options.barMargin;
//                            maxValue = d3.max(data, function (d) { return d.value;});

                            // set the height

                            if (d3Options.compressed === "yes") {
                                actualHeightFinal = actualHeightCompressed;
                                chartCanvas.attr('height', actualHeightCompressed);
                            } else {
                                actualHeightFinal = d3Options.chartHeight - d3Options.marginTop - d3Options.xScaleTopHeight - (d3Options.marginBottom / 2);
                                d3Options.barHeight = (d3Options.barHeight * d3Options.chartHeight / actualHeightCompressed);
                                d3Options.barHeight = ((actualHeightFinal + d3Options.barMargin) / series.length) - d3Options.barMargin;
                            }

                            // the x and y scales

                            var x = d3.scale.linear()
                                .domain([0, d3.max(values)])
                                .range([0, currentWidth]);

                            var y = d3.scale.ordinal()
                                .domain(d3.range(series.length))
                                .rangeRoundBands([0, actualHeightFinal], (d3Options.barMargin / d3Options.barHeight), (d3Options.marginTop / d3Options.barHeight));
//                                .rangeBands([0, actualHeightFinal]);

                            // Canvas for the top x scale

                            var xScaleTopCanvas = chartCanvas.append("g")      //
                                .attr("height", d3Options.xScaleTopHeight)
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
                                .attr("height", d3Options.barHeight)  // height of each bar
                                .attr("width", 0)           // initial width of 0 for transition
                                .attr("x", 0)
                                .attr('y', function(d,i) {
                                    return i * (d3Options.barHeight + d3Options.barMargin);
                                })
                                .transition()
                                .duration(1000)             // time of duration
                                .attr("width", function(d) {
                                    return x(d);
                                })
                            ;

                            gridCanvas.selectAll("value")
                                .data(values)
                                .enter()
                                .append("text")
                                .attr("y", function(d,i) {
                                    return i * (d3Options.barHeight + d3Options.barMargin);
                                })
                                .attr("dy", "1.35em")
                                .attr("x", function (d) {
                                    return x(d);
                                })
                                .attr("dx", function (d,i) {
                                    if (x(d) < d3Options.insetThreshold) {
                                        return +20;
                                    } else {
                                        return -5;
                                    }
                                })
                                .attr("text-anchor", "end")
                                .attr("class", "youpers-chart-value")
                                .style("fill", function (d,i) {
                                    if (x(d) < d3Options.insetThreshold) {
                                        return "#000";
                                    } else {
                                        return "#fff";
                                    }
                                })
                            .text(function(d) {
                                    return d.toString();
                                });

                            gridCanvas.selectAll("label")
                                .data(labels)
                                .enter()
                                .append("text")
                                .attr("dy", "1.35em")
                                .attr("y", y)   // does not work, that's why I overwrite it!!
                                .attr("y", function(d,i) {
                                    return i * (d3Options.barHeight + d3Options.barMargin);
                                })
//                                .attr("dx", 5)
                                .attr("dx", function (d,i) {
                                    if (x(d) < d3Options.insetThreshold) {
                                        return d3Options.insetThreshold + 45;
                                    } else {
                                        return 5;
                                    }
                                })
                                .attr("x", 0)
                                .attr("class", "youpers-chart-label")
                                .text(function(d) {
                                    return d;
                                });

                            gridCanvas.append("line")
                                .attr("y1", 0)
                                .attr("y2", actualHeightFinal)
                                .style("stroke", "#000");

                        };

                    });
                }
            };
        }])

        .directive('d3Gauge', ['d3Service', function(d3Service) {
            return {
                restrict: 'EA',
                scope: {
                    data: "=",
                    label: "@",
                    onClick: "&",
                    options: "="
                },
                link: function(scope, iElement, iAttrs) {
                    d3Service.d3().then(function(d3){

                        var d3Options = {};

                        // generating defaults, if options are not set

                        if (typeof scope.options === 'undefined') {
                        } else {
                            d3Options = scope.options;
                        }

                        // d3Options.compressed
                        // - "yes": calculate height based on number of bars and other parameters -> best fit of a chart
                        // - "no": value of d3Options.chartHeight is taken

                        if (typeof d3Options.compressed === 'undefined') {
                            d3Options.compressed = "yes";
                        }

                        // d3Options.chartHeight
                        // height of chart in px
                        // - string containing a number without 'px'
                        // - ignored if d3Options.compressed is set to "yes"

                        if (typeof d3Options.chartHeight === 'undefined') {
                            d3Options.chartHeight = "200";
                        }

                        // d3Options.chartWidth
                        // width of chart
                        // - ideally set as %-value to elastically fit into the parent container of the chart

                        if (typeof d3Options.chartWidth === 'undefined') {
                            d3Options.chartWidth = "100%";
                        }

                        // d3Options.xScaleTopHeight
                        // height of the space containing the x scale on top of the chart

                        if (typeof d3Options.xScaleTopHeight === 'undefined') {
                            d3Options.xScaleTopHeight = 15;
                        }

                        // d3Options.marginTop
                        // top margin of the complete chart
                        // - ideally set to a minimum of 5 to avoid cropping of x scale values on top of the chart

                        if (typeof d3Options.marginTop === 'undefined') {
                            d3Options.marginTop = 5;
                        }

                        // d3Options.marginLeft
                        // left margin of the complete chart
                        // - ideally set to a minimum of 5 to avoid cropping of the first x scale value on top of the chart

                        if (typeof d3Options.marginLeft === 'undefined') {
                            d3Options.marginLeft = 5;
                        }

                        // d3Options.marginBottom
                        // bottom margin of the complete chart

                        if (typeof d3Options.marginBottom === 'undefined') {
                            d3Options.marginBottom = 10;
                        }

                        // d3Options.marginRight
                        // right margin of the complete chart

                        if (typeof d3Options.marginRight === 'undefined') {
                            d3Options.marginRight = 10;
                        }

                        // d3Options.barHeight
                        // height of a horizontal bar

                        if (typeof d3Options.barHeight === 'undefined') {
                            d3Options.barHeight = 30;
                        }

                        // d3Options.barMargin
                        // margin between horizontal bars

                        if (typeof d3Options.barMargin === 'undefined') {
                            d3Options.barMargin = 5;
                        }

                        // d3Options.insetThreshold
                        // - bars smaller than this value have their value displayed outside of the bar
                        // - bars equal and larger than this value have heir value displayed inside of the bar

                        if (typeof d3Options.insetThreshold === 'undefined') {
                            d3Options.insetThreshold = 200;
                        }

                        var actualHeightCompressed = (scope.data.length * (d3Options.barHeight + d3Options.barMargin)) - d3Options.barMargin + d3Options.xScaleTopHeight + d3Options.marginBottom;

                        // svgCanvas: Container with n g-containers
                        // only chartCanvas is stored in this container

                        var svgCanvas = d3.select(iElement[0])
                            .append("svg")
                            .attr("width", d3Options.chartWidth)        // width as set in the <d3-bars width=...
                            .attr("height", d3Options.chartHeight)      // height as set in the <d3-bars height=...
                            .attr("class", "youpers-chart");    // set class to link appropriate CSS

                        if (d3Options.compressed === "yes") {  //
                            svgCanvas.attr('height', actualHeightCompressed);
                        }

                        // chartCanvas: the only element stored in svgCanvas

                        var chartCanvas = svgCanvas.append("g")
                            .attr("transform", "translate(" + d3Options.marginTop + "," + d3Options.marginLeft + ")")    // top/left margin to avoid cropped elements
                            .attr("height", "100%")                 // fills the complete height of the parent container
                            .attr("width", "100%");                 // fills the complete width of the parent container

                        // on window resize, re-render d3 canvas

                        window.onresize = function() {
                            return scope.$apply();
                        };

                        scope.$watch(function(){
                                return angular.element(window)[0].innerWidth;
                            }, function(){
                                return scope.render(scope.data);
                            }
                        );

                        // watch for data changes and re-render
                        scope.$watch('data', function(newVals, oldVals) {
                            return scope.render(newVals);
                        }, true);

                        // define render function
                        scope.render = function(data){

                            // segregate values from labels

                            var labels = [];
                            var values = [];

                            for (var i = 0; i < data.length; i++) {
                                labels.push(data[i].label);
                                values.push(data[i].value);
                            }

                            // remove all previous items before render

                            chartCanvas.selectAll("*").remove();

                            // setup variables

                            var currentWidth,       // current width in px taking resizing into account
                                actualHeightFinal;  // height if d3-height-compress="no"

                            currentWidth = d3.select(iElement[0])[0][0].offsetWidth - (d3Options.marginLeft + d3Options.marginRight);
                            actualHeightCompressed = (scope.data.length * (d3Options.barHeight + d3Options.barMargin)) - d3Options.barMargin;
//                            maxValue = d3.max(data, function (d) { return d.value;});

                            // set the height

                            if (d3Options.compressed === "yes") {
                                actualHeightFinal = actualHeightCompressed;
                                chartCanvas.attr('height', actualHeightCompressed);
                            } else {
                                actualHeightFinal = d3Options.chartHeight - d3Options.marginTop - d3Options.xScaleTopHeight - (d3Options.marginBottom / 2);
                                d3Options.barHeight = (d3Options.barHeight * d3Options.chartHeight / actualHeightCompressed);
                                d3Options.barHeight = ((actualHeightFinal + d3Options.barMargin) / scope.data.length) - d3Options.barMargin;
                            }

                            // the x and y scales

                            var x = d3.scale.linear()
                                .domain([0, d3.max(values)])
                                .range([0, currentWidth]);

                            var y = d3.scale.ordinal()
                                .domain(d3.range(scope.data.length))
                                .rangeRoundBands([0, actualHeightFinal], (d3Options.barMargin / d3Options.barHeight), (d3Options.marginTop / d3Options.barHeight));
//                                .rangeBands([0, actualHeightFinal]);

                            // Canvas for the top x scale

                            var xScaleTopCanvas = chartCanvas.append("g")      //
                                .attr("height", d3Options.xScaleTopHeight)
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
                                .attr("height", d3Options.barHeight)  // height of each bar
                                .attr("width", 0)           // initial width of 0 for transition
                                .attr("x", 0)
                                .attr('y', function(d,i) {
                                    return i * (d3Options.barHeight + d3Options.barMargin);
                                })
                                .transition()
                                .duration(1000)             // time of duration
                                .attr("width", function(d) {
                                    return x(d);
                                })
                            ;

                            gridCanvas.selectAll("value")
                                .data(values)
                                .enter()
                                .append("text")
                                .attr("y", function(d,i) {
                                    return i * (d3Options.barHeight + d3Options.barMargin);
                                })
                                .attr("dy", "1.35em")
                                .attr("x", function (d) {
                                    return x(d);
                                })
                                .attr("dx", function (d,i) {
                                    if (x(d) < d3Options.insetThreshold) {
                                        return +20;
                                    } else {
                                        return -5;
                                    }
                                })
                                .attr("text-anchor", "end")
                                .attr("class", "youpers-chart-value")
                                .style("fill", function (d,i) {
                                    if (x(d) < d3Options.insetThreshold) {
                                        return "#000";
                                    } else {
                                        return "#fff";
                                    }
                                })
                            .text(function(d) {
                                    return d.toString();
                                });

                            gridCanvas.selectAll("label")
                                .data(labels)
                                .enter()
                                .append("text")
                                .attr("dy", "1.35em")
                                .attr("y", y)   // does not work, that's why I overwrite it!!
                                .attr("y", function(d,i) {
                                    return i * (d3Options.barHeight + d3Options.barMargin);
                                })
//                                .attr("dx", 5)
                                .attr("dx", function (d,i) {
                                    if (x(d) < d3Options.insetThreshold) {
                                        return d3Options.insetThreshold + 45;
                                    } else {
                                        return 5;
                                    }
                                })
                                .attr("x", 0)
                                .attr("class", "youpers-chart-label")
                                .text(function(d) {
                                    return d;
                                });

                            gridCanvas.append("line")
                                .attr("y1", 0)
                                .attr("y2", actualHeightFinal)
                                .style("stroke", "#000");

                        };

                    });
                }
            };
        }]);

}());
