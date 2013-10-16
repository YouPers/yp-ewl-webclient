(function () {
    'use strict';

    angular.module('d3.directives', ['d3'])
        .directive('d3HorizontalBarChart', ['d3Service', function(d3Service) {
            return {
                restrict: 'EA',
                scope: {
                    data: "=",
                    label: "@",
                    onClick: "&"
                },
                link: function(scope, iElement, iAttrs) {
                    d3Service.d3().then(function(d3){

                        var barHeight = 30;         // height of a horizontal bar
                        var barMargin = 5;          // margin between horizontal bars
                        var xScaleTopHeight = 15;   // Height to store the top x scale
                        var marginTop = 5;          // top margin
                        var marginLeft = 5;         // left margin
                        var marginBottom = 10;      // bottom margin
                        var marginRight = 10;       // right margin

                        var actualHeightCompressed = (scope.data.length * (barHeight + barMargin)) - barMargin + xScaleTopHeight + marginBottom;

                        // svgCanvas: Container with n g-containers
                        // only chartCanvas is stored in this container

                        var svgCanvas = d3.select(iElement[0])
                            .append("svg")
                            .attr("width", iAttrs.width)        // width as set in the <d3-bars width=...
                            .attr("height", iAttrs.height)      // height as set in the <d3-bars height=...
                            .attr("class", "youpers-chart");    // set class to link appropriate CSS

                        if (iAttrs.d3HeightCompress === "yes") {  //
                            svgCanvas.attr('height', actualHeightCompressed);
                        }

                        // chartCanvas: the only element stored in svgCanvas

                        var chartCanvas = svgCanvas.append("g")
                            .attr("transform", "translate(" + marginTop + "," + marginLeft + ")")    // top/left margin to avoid cropped elements
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

                            currentWidth = d3.select(iElement[0])[0][0].offsetWidth - (marginLeft + marginRight);
                            actualHeightCompressed = (scope.data.length * (barHeight + barMargin)) - barMargin;
//                            maxValue = d3.max(data, function (d) { return d.value;});

                            // set the height

                            if (iAttrs.d3HeightCompress === "yes") {
                                actualHeightFinal = actualHeightCompressed;
                                chartCanvas.attr('height', actualHeightCompressed);
                            } else {
                                actualHeightFinal = iAttrs.height - marginTop - xScaleTopHeight - (marginBottom / 2);
                                barHeight = (barHeight * iAttrs.height / actualHeightCompressed);
                                barHeight = ((actualHeightFinal + barMargin) / scope.data.length) - barMargin;
                            }

                            // the x and y scales

                            var x = d3.scale.linear()
                                .domain([0, d3.max(values)])
                                .range([0, currentWidth]);

                            var y = d3.scale.ordinal()
                                .domain(d3.range(scope.data.length))
                                .rangeRoundBands([0, actualHeightFinal], (barMargin /barHeight), (marginTop /barHeight));
//                                .rangeBands([0, actualHeightFinal]);

                            // Canvas for the top x scale

                            var xScaleTopCanvas = chartCanvas.append("g")      //
                                .attr("height", xScaleTopHeight)
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
                                .attr("height", barHeight)  // height of each bar
                                .attr("width", 0)           // initial width of 0 for transition
                                .attr("x", 0)
                                .attr('y', function(d,i) {
                                    return i * (barHeight + barMargin);
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
                                    return i * (barHeight + barMargin);
                                })
                                .attr("dy", "1.35em")
                                .attr("dx", -5)
                                .attr("x", function (d) {
                                    return x(d);
                                })
                                .attr("text-anchor", "end")
                                .attr("class", "youpers-chart-value")
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
                                    return i * (barHeight + barMargin);
                                })
                                .attr("x", 0)
                                .attr("dx", 5)
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
