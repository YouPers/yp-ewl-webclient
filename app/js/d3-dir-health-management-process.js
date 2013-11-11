(function () {
    'use strict';

    angular.module('d3.dir-health-management-process', ['d3'])
        .directive('d3HealthManagementProcess', ['$rootScope', '$timeout', 'd3Service', function($rootScope, $timeout, d3Service) {
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

                        var stepToHighlight;

                        var steps = [
                            { "name": "commit", "url": "#/topics"},
                            { "name": "assess", "url": "#/assessment/525faf0ac558d40000000005"},
                            { "name": "plan", "url": "#/activities"},
                            { "name": "do", "url": "#/cockpit"},
                            { "name": "evaluate", "url": "#/evaluate"}
                        ];

                        var initParameters = function () {

                            // generating defaults, if options are not set

                            scope.options = typeof scope.options !== 'undefined' ? scope.options : {};

                            // scope.options.elementHeight
                            // height of chart in px
                            // - string containing a number without 'px'
                            // - ignored if scope.options.relative is set to "yes"

                            scope.options.elementHeight = typeof scope.options.elementHeight !== 'undefined' ? scope.options.elementHeight : 50;

                            // scope.options.chartWidth
                            // width of chart
                            // - ideally set as %-value to elastically fit into the parent container of the chart

                            scope.options.chartWidth = typeof scope.options.chartWidth !== 'undefined' ? scope.options.chartWidth : "99.5%";

                            // scope.options.marginTop
                            // top margin of the complete chart
                            // - ideally set to a minimum of 5 to avoid cropping of x scale values on top of the chart

                            scope.options.marginTop = typeof scope.options.marginTop !== 'undefined' ? scope.options.marginTop : 10;

                            // scope.options.marginLeft
                            // left margin of the complete chart
                            // - ideally set to a minimum of 5 to avoid cropping of the first x scale value on top of the chart

                            scope.options.marginLeft = typeof scope.options.marginLeft !== 'undefined' ? scope.options.marginLeft : 10;

                            // scope.options.marginBottom
                            // bottom margin of the complete chart

                            scope.options.marginBottom = typeof scope.options.marginBottom !== 'undefined' ? scope.options.marginBottom : 10;

                            // scope.options.marginRight
                            // right margin of the complete chart

                            scope.options.marginRight = typeof scope.options.marginRight !== 'undefined' ? scope.options.marginRight : 15;

                            // scope.options.elementWidth
                            // width of an element

                            scope.options.elementWidth = typeof scope.options.elementWidth !== 'undefined' ? scope.options.elementWidth : 100;

                            // scope.options.arrowHeadWidth
                            // width of an element's arrowhead

                            scope.options.arrowHeadWidth = typeof scope.options.arrowHeadWidth !== 'undefined' ? scope.options.arrowHeadWidth : 15;

                            // scope.options.elementMargin
                            // margin between the five elements

                            scope.options.elementMargin = typeof scope.options.elementMargin !== 'undefined' ? scope.options.elementMargin : -5;

                            // scope.options.elementPaddingLeft
                            // left margin for element's text

                            scope.options.elementPaddingLeft = typeof scope.options.elementPaddingLeft !== 'undefined' ? scope.options.elementPaddingLeft : 5;

                            // scope.options.displayType
                            // "commit": highlights first process step
                            // "assess": highlights second process step
                            // "plan": highlights third process step
                            // "do": highlights fourth process step
                            // "evaluate": highlights fifth process step

                            scope.options.displayType = typeof scope.options.displayType !== 'undefined' ? scope.options.displayType : "do";

                        };

                        var isDone = function (processStep) {
                            if (processStep === 0) {
                                return data.statusCommit;
                            }
                            if (processStep === 1) {
                                return data.statusAssess;
                            }
                            if (processStep === 2) {
                                return data.statusPlan;
                            }
                            if (processStep === 3) {
                                return data.statusDo;
                            }
                            if (processStep === 4) {
                                return data.statusEvaluate;
                            }
                        };

                        var setCurrentStep = function (processStep) {
                            var stepStatus = [false, false, false, false, false];
                            for (var i = 0; i < steps.length; i++) {
                                if (steps[i].name === processStep) {
                                    stepStatus [i] = true;
                                }
                            }
                            return stepStatus;
                        };

                        var getElementColorForOtherPages = function (processStep) {
                            if (stepToHighlight[processStep]) {
                                return "#aec71e";
                            } else {
                                return "#eeeeee";
                            }
                        };

                        initParameters();

                        var createHealthManagementProcess = function () {

                            // svgCanvas: Main container containing chartCanvas
                            // first, remove any old main containers

                            var elements = [];
                            var statusSymbols = [];

                            for (var i = 0; i < steps.length; i++) {
                                var x = (i * scope.options.elementWidth) + (i *scope.options.elementMargin);
                                var lineData = [
                                    {"x": x, "y": 0},
                                    {"x": x + scope.options.elementWidth - scope.options.arrowHeadWidth, "y": 0},
                                    {"x": x + scope.options.elementWidth, "y": scope.options.elementHeight / 2},
                                    {"x": x + scope.options.elementWidth - scope.options.arrowHeadWidth, "y": scope.options.elementHeight},
                                    {"x": x, "y": scope.options.elementHeight},
                                    {"x": x + scope.options.arrowHeadWidth, "y": scope.options.elementHeight / 2}
                                ];
                                elements.push(lineData);
                            }

                            var lineFunction = d3.svg.line()
                                .x(function(d) {
                                    return d.x;
                                })
                                .y(function(d) {
                                    return d.y;
                                })
                                .interpolate("linear");

                            d3.select(iElement[0]).select("svg").remove();

                            var svg = d3.select(iElement[0]).append("svg")
                                .attr("width", scope.options.chartWidth)
                                .attr("height", scope.options.elementHeight + scope.options.marginTop + scope.options.marginBottom)
                                .attr("class", "youpers-health-management-process");

                            var svgCanvas = svg.append("g")
                                .attr("transform", "translate(" + scope.options.marginLeft + "," + scope.options.marginTop + ")");

                            var elementColor;

                            stepToHighlight = setCurrentStep(scope.options.displayType);

                            for (var i2 = 0; i2 < steps.length; i2++) {
                                elementColor = getElementColorForOtherPages(i2);

                                svgCanvas.append("svg:a")
                                    .attr("xlink:href", steps[i2].url)
                                    .append("path")
                                    .attr("id", steps[i2].name)
                                    .attr("d", lineFunction(elements[i2]))
                                    .attr("fill", elementColor);


                                if (isDone(i2)) {

                                    var sign = svgCanvas.append("g")
                                        .attr("transform", "translate(" + ((i2 * scope.options.elementWidth) + (i2 *scope.options.elementMargin) + (scope.options.elementWidth * 0.6)) + ", -5)");

                                    sign.append("svg:a")
                                        .attr("xlink:href", steps[i2].url)
                                        .append("line")
                                        .attr("x1", "5")
                                        .attr("y1", scope.options.elementHeight-5)
                                        .attr("x2", "10")
                                        .attr("y2", scope.options.elementHeight)
                                        .attr("stroke-width", "1")
                                        .attr("stroke", "#DC3912");

                                    sign.append("svg:a")
                                        .attr("xlink:href", steps[i2].url)
                                        .append("line")
                                        .attr("x1", "10")
                                        .attr("y1", scope.options.elementHeight)
                                        .attr("x2", "25")
                                        .attr("y2", scope.options.elementHeight-15)
                                        .attr("stroke-width", "1")
                                        .attr("stroke", "#DC3912");
                                }

                            }

                            for (var i4 = 0; i4 < steps.length; i4++) {

                                var stepName = steps[i4].name;
                                var stepUrl = steps[i4].url;
                                var x4 = (i4 * scope.options.elementWidth) + (i4 *scope.options.elementMargin) + (scope.options.elementWidth / 2);

                                svgCanvas.append("svg:a")
                                    .attr("xlink:href", stepUrl)
                                    .attr("class", "youpers-health-management-process-label")
                                    .append("text")
                                    .attr("x", x4)
                                    .attr("y", scope.options.elementHeight / 2)
                                    .attr("dy", "0.25em")
                                    .attr("width", scope.options.elementWidth)
                                    .style("text-anchor", "middle")
                                    .text(stepName);

                            }
                        };

                        createHealthManagementProcess();

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
