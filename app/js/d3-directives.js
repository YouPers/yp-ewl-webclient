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

                        var canvasWidth = iAttrs.width;     // width as set in the <d3-bars width=...
                        var canvasHeight = iAttrs.height;   // height as set in the <d3-bars height=...

                        var svg = d3.select(iElement[0])
                                .append("svg")
                                .attr("width", canvasWidth)
                                .attr("height", canvasHeight)
                                .attr("class", "youpers-chart")    // set class to link appropriate CSS
                            .append("g")
                            .attr("transform", "translate(5,5)")
                            .attr("height", canvasHeight - 5)
                            .attr("width", canvasWidth - 5);

//                        ;
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
                            svg.selectAll("*").remove();

                            // setup variables
                            var currentWidth,       // current width in px taking resizing into account
                                allBarsHeight,      // height of all bars, to be used if <d3-bars height="0"
                                actualHeight,       // height used for canvas
                                maxValue,           // highest value of data array, needed to scale appropriately
                                marginLeft,         // margin left of the bars to be used
                                marginRight,        // margin right of the bars to be used
                                marginTop,          // margin on top of the bars to be used
                                marginBottom,       // margin on bottom of the bars to be used
                                barHeight,          // height of a horizontal bar
                                barMargin;    // margin between horizontal bars

                            marginLeft = 10;
                            marginRight = 10;
                            marginTop = 10;
                            marginBottom = 10;
                            barHeight = 30;
                            barMargin = 5;

                            currentWidth = d3.select(iElement[0])[0][0].offsetWidth - (marginLeft + marginRight);
                            allBarsHeight = (scope.data.length * (barHeight + barMargin)) + barMargin;
                            maxValue = d3.max(data, function (d) { return d.value;});

                            // set the height

                            if (svg.attr("height") === "0") {
                                actualHeight = allBarsHeight;
                                svg.attr('height', actualHeight);
                            } else {
                                actualHeight = svg.attr("height");
                            }

                            // the x and y scales

                            var x = d3.scale.linear()
                                .domain([0, d3.max(values)])
                                .range([0, currentWidth]);

                            var y = d3.scale.ordinal()
//                                .domain(values)
                                .domain(d3.range(scope.data.length))
                                .rangeRoundBands([0, actualHeight], (barMargin /barHeight), (marginTop /barHeight));
//                                .rangeBands([0, actualHeight]);

                            //create the rectangles for the bar chart

                            var g = svg.append("g")
                                .attr("transform", "translate(0,15)")
                                .attr("height", canvasHeight - 15)
                                .attr("width", canvasWidth);

                            g.selectAll("line")
                                .data(x.ticks(10))
                                .enter().append("line")
                                .attr("x1", x)
                                .attr("x2", x)
                                .attr("y1", 0)
                                .attr("y2", actualHeight)
//                                .attr("dx", marginLeft + 50)
                                .style("stroke", "#ccc");

                            svg.selectAll(".rule")
                                .data(x.ticks(10))
                                .enter().append("text")
                                .attr("class", "rule")
                                .attr("x", x)
                                .attr("y", 0)
                                .attr("dy", marginTop)
                                .attr("text-anchor", "middle")
//                                .attr("dx", marginLeft + 5)
                                .text(String);

                            g.selectAll("rect")
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
//                                .attr("x", x)
                                .attr("x", 0)
//                                .attr("y", y) // does not work!!
                                .attr('y', function(d,i) {
                                    return i * (barHeight + marginTop);
                                })
                                .transition()
                                .duration(2000)             // time of duration
                                .attr("width", function(d) {
                                    return x(d);
                                })
                            ;

                            g.selectAll("value")
                                .data(values)
                                .enter()
                                .append("text")
                                .attr("y", function(d,i) {
                                    return i * (barHeight + marginTop);
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

                            g.selectAll("label")
                                .data(labels)
                                .enter()
                                .append("text")
                                .attr("dy", "1.35em")
                                .attr("y", y) // does not work!!
                                .attr("y", function(d,i) {
                                    return i * (barHeight + marginTop);
                                })
                                .attr("x", 0)
                                .attr("dx", 5)
                                .attr("class", "youpers-chart-label")
                                .text(function(d) {
                                    return d;
                                });

                            g.append("line")
                                .attr("y1", 0)
                                .attr("y2", actualHeight)
                                .style("stroke", "#000");

                        };

                    });
                }
            };
        }]);

}());
