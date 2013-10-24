(function () {
    'use strict';

    angular.module('d3.gauge', ['d3'])
        .directive('d3Gauge', ['$rootScope', '$timeout', 'd3Service', function($rootScope, $timeout, d3Service) {
            return {
                restrict: 'EA',
                scope: {
                    data: "=",
                    label: "@",
                    onClick: "&",
                    options: "="
                },
                link: function(scope, iElement) {

                    // watch for data changes and re-render
                    scope.$watch('data', function(newVals, oldVals) {

                        if (typeof newVals !== 'undefined') {

                            d3Service.d3().then(function(d3){

                                if (!gaugeDrawn) {
                                    createGauge(d3, angular.fromJson(newVals));
                                    gaugeDrawn = true;
                                }
                                $timeout(function () {
                                    drawGauge(angular.fromJson(newVals));
                                }, 500);

                            });

                        }

                    }, true);

                    // Redraw the chart if the window is resized
                    $rootScope.$on('resizeMsg', function (e) {
                        $timeout(function () {
                            drawGauge(angular.fromJson(scope.data));
                        }, 1000);
                    });

                    var gaugeDrawn = false;

                    var zones;

                    var toDegrees = function (value) {
                        // Note: tried to factor out 'this._range * 270' but that breaks things, most likely due to rounding behavior
                        return value / scope.options.range * 270 - (scope.options.min / scope.options.range * 270 + 45);
                    };

                    var toRadians = function (value) {
                        return toDegrees(value) * Math.PI / 180;
                    };

                    var initZones = function () {

                        function percentToVal (percent) {
                            return scope.options.min + scope.options.range * percent;
                        }

                        function initZone (zone) {
                            return {
                                clazz: zone.clazz ,
                                from: percentToVal(zone.from),
                                to:  percentToVal(zone.to)
                            };
                        }

                        // create new zones to not mess with the passed in args
                        zones = scope.options.zones.map(initZone);
                    };

                    var initParameters = function () {

                        // generating defaults, if options are not set

                        scope.options = typeof scope.options !== 'undefined' ? scope.options : {};

                        scope.options.size = typeof scope.options.size !== 'undefined' ? scope.options.size : 100;

                        scope.options.radius = scope.options.size * 0.9 / 2;

                        scope.options.cx = scope.options.size / 2;
                        scope.options.cy = scope.options.size / 2;

                        scope.options.min = typeof scope.options.min !== 'undefined' ? scope.options.min : 0;
                        scope.options.max = typeof scope.options.max !== 'undefined' ? scope.options.max : 10;
                        scope.options.range = scope.options.max - scope.options.min;

                        scope.options.majorTicks = typeof scope.options.majorTicks !== 'undefined' ? scope.options.majorTicks : 5;
                        scope.options.minorTicks = typeof scope.options.minorTicks !== 'undefined' ? scope.options.minorTicks : 2;

                        scope.options.needleWidthRatio = typeof scope.options.needleWidthRatio !== 'undefined' ? scope.options.needleWidthRatio : 0.6;
                        scope.options.needleContainerRadiusRatio = typeof scope.options.needleContainerRadiusRatio !== 'undefined' ? scope.options.needleContainerRadiusRatio : 0.7;

                        scope.options.colorBackground = typeof scope.options.colorBackground !== 'undefined' ? scope.options.colorBackground : "#FFFFFF";
                        scope.options.colorNormal = typeof scope.options.colorNormal !== 'undefined' ? scope.options.colorNormal : "#109618";
                        scope.options.colorWarnLevel1 = typeof scope.options.colorWarnLevel1 !== 'undefined' ? scope.options.colorWarnLevel1 : "#FF9900";
                        scope.options.colorWarnLevel2 = typeof scope.options.colorWarnLevel2 !== 'undefined' ? scope.options.colorWarnLevel2 : "#DC3912";

                        scope.options.transitionDuration = typeof scope.options.transitionDuration !== 'undefined' ? scope.options.transitionDuration : 500;

                        scope.options.greenZone = typeof scope.options.greenZone !== 'undefined' ?
                            scope.options.greenZone :
                            [{ from: scope.options.min + scope.options.range*0.5, to: scope.options.min + scope.options.range*0.75 }];

                        scope.options.yellowZone = typeof scope.options.yellowZone !== 'undefined' ?
                            scope.options.yellowZone :
                            [{ from: scope.options.min + scope.options.range*0.75, to: scope.options.min + scope.options.range*0.87 }];

                        scope.options.redZone = typeof scope.options.redZone !== 'undefined' ?
                            scope.options.redZone :
                            [{ from: scope.options.min + scope.options.range*0.87, to: scope.options.min + scope.options.max }];

                        var defaultZones = [
                            { clazz: 'red-zone', from: 0.0, to: 0.13 },
                            { clazz: 'yellow-zone', from: 0.13, to: 0.37 },
                            { clazz: 'green-zone', from: 0.37, to: 0.63 },
                            { clazz: 'yellow-zone', from: 0.63, to: 0.87 },
                            { clazz: 'red-zone', from: 0.87, to: 1.0 }
                        ];

                        scope.options.zones = typeof scope.options.zones !== 'undefined' ? scope.options.zones : defaultZones;
                        scope.options.clazz = typeof scope.options.clazz !== 'undefined' ? scope.options.clazz : "simple";

                    };

                    var initGauge = function (d3) {
                        // first, remove any old main containers
                        d3.select(iElement[0]).select("svg").remove();

                        scope.svgCanvas = d3.select(iElement[0])
                            .append('svg:svg')
                            .attr('class'  ,  'youpers-gauge' + (scope.options.clazz ? ' ' + scope.options.clazz : ''))
                            .attr('width'  ,  scope.options.size)
                            .attr('height' ,  scope.options.size);
                    };

                    var drawOuterCircle = function () {
                        scope.svgCanvas
                            .append('svg:circle')
                            .attr('class' ,  'outer-circle')
                            .attr('cx'    ,  scope.options.cx)
                            .attr('cy'    ,  scope.options.cy)
                            .attr('r'     ,  scope.options.radius);
                    };

                    var drawInnerCircle = function () {
                        scope.svgCanvas
                            .append('svg:circle')
                            .attr('class' ,  'inner-circle')
                            .attr('cx'    ,  scope.options.cx)
                            .attr('cy'    ,  scope.options.cy)
                            .attr('r'     ,  0.9 * scope.options.radius);
                    };

                    var drawLabel = function (label) {
                        if (typeof label === 'undefined') {
                            return;
                        }

                        var fontSize = Math.round(scope.options.size / 9);
                        var halfFontSize = fontSize / 2;

                        scope.svgCanvas
                            .append('svg:text')
                            .attr('class', 'label')
                            .attr('x', scope.options.cx)
                            .attr('y', scope.options.cy / 2 + halfFontSize)
                            .attr('dy', halfFontSize)
                            .attr('text-anchor', 'middle')
                            .text(label);
                    };

                    var drawBand = function (d3, start, end, clazz) {
//                                var self = this;

                        function transform () {
                            return 'translate(' + scope.options.cx + ', ' + scope.options.cy +') rotate(270)';
                        }

                        var arc = d3.svg.arc()
                                .startAngle(toRadians(start))
                                .endAngle(toRadians(end))
                                .innerRadius(0.65 * scope.options.radius)
                                .outerRadius(0.85 * scope.options.radius)
                            ;

                        scope.svgCanvas
                            .append('svg:path')
                            .attr('class', clazz)
                            .attr('d', arc)
                            .attr('transform', transform);
                    };

                    var drawZones = function (d3) {
                        function drawZone (zone) {
                            drawBand(d3, zone.from, zone.to, zone.clazz);
                        }

                        zones.forEach(drawZone);
                    };

                    var drawLine = function (p1, p2, clazz) {
                        scope.svgCanvas
                            .append('svg:line')
                            .attr('class' ,  clazz)
                            .attr('x1'    ,  p1.x)
                            .attr('y1'    ,  p1.y)
                            .attr('x2'    ,  p2.x)
                            .attr('y2'    ,  p2.y);
                    };

                    var toPoint = function (value, factor) {
                        var len = scope.options.radius * factor;
                        var inRadians = toRadians(value);
                        return {
                            x: scope.options.cx - len * Math.cos(inRadians),
                            y: scope.options.cy - len * Math.sin(inRadians)
                        };
                    };

                    var drawTicks = function () {
                        var majorDelta = scope.options.range / (scope.options.majorTicks - 1),
                            minorDelta = majorDelta / scope.options.minorTicks,
                            point
                            ;

                        for (var major = scope.options.min; major <= scope.options.max; major += majorDelta) {
                            var minorMax = Math.min(major + majorDelta, scope.options.max);
                            for (var minor = major + minorDelta; minor < minorMax; minor += minorDelta) {
                                drawLine(toPoint(minor, 0.75), toPoint(minor, 0.85), 'minor-tick');
                            }

                            drawLine(toPoint(major, 0.7), toPoint(major, 0.85), 'major-tick');

                            if (major === scope.options.min || major === scope.options.max) {
                                point = toPoint(major, 0.63);
                                scope.svgCanvas
                                    .append('svg:text')
                                    .attr('class', 'major-tick-label')
                                    .attr('x', point.x)
                                    .attr('y', point.y)
                                    .attr('text-anchor', major === scope.options.min ? 'start' : 'end')
                                    .text(major);
                            }
                        }
                    };

                    var buildNeedlePath = function (value) {

                        function valueToPoint(value, factor) {
                            var point = toPoint(value, factor);
                            point.x -= scope.options.cx;
                            point.y -= scope.options.cy;
                            return point;
                        }

                        var delta = scope.options.range * scope.options.needleWidthRatio / 10,
                            tailValue = value - (scope.options.range * (1/ (270/360)) / 2);

                        var head = valueToPoint(value, 0.85),
                            head1 = valueToPoint(value - delta, 0.12),
                            head2 = valueToPoint(value + delta, 0.12);

                        var tail = valueToPoint(tailValue, 0.28),
                            tail1 = valueToPoint(tailValue - delta, 0.12),
                            tail2 = valueToPoint(tailValue + delta, 0.12);

                        return [head, head1, tail2, tail, tail1, head2, head];
                    };

                    var drawNeedle = function (d3) {

                        var needleContainer = scope.svgCanvas
                            .append('svg:g')
                            .attr('class', 'needle-container');

                        var midValue = (scope.options.min + scope.options.max) / 2;

                        var needlePath = buildNeedlePath(midValue);

                        var needleLine = d3.svg.line()
                            .x(function(d) {
                                return d.x;
                            })
                            .y(function(d) {
                                return d.y;
                            })
                            .interpolate('basis');

                        needleContainer
                            .selectAll('path')
                            .data([ needlePath ])
                            .enter()
                            .append('svg:path')
                            .attr('class', 'needle')
                            .attr('d', needleLine);

                        needleContainer
                            .append('svg:circle')
                            .attr('cx',  scope.options.cx)
                            .attr('cy',  scope.options.cy)
                            .attr('r',  scope.options.radius * scope.options.needleContainerRadiusRatio / 10);

                        // TODO: not styling font-size since we need to calculate other values from it
                        //       how do I extract style value?
                        var fontSize = Math.round(scope.options.size / 10);
                        needleContainer
                            .selectAll('text')
                            .data([ midValue ])
                            .enter()
                            .append('svg:text')
                            .attr('x', scope.options.cx)
                            .attr('y', scope.options.size - scope.options.cy / 4 - fontSize)
                            .attr('dy', fontSize / 2)
                            .attr('text-anchor', 'middle');
                    };

                    var render = function (d3, label) {
                        initGauge(d3);
                        drawOuterCircle();
                        drawInnerCircle();
                        drawLabel(label);

                        drawZones(d3);
                        drawTicks();

                        drawNeedle(d3);
                        write(scope.options.min, 0);
                    };

                    var createGauge = function (d3, data) {

                        initParameters();

                        initZones();

                        render(d3, data.label);

                    };

                    var write = function(value, transitionDuration) {

                        function transition () {
                            var needleValue = value,
                                overflow = value > scope.options.max,
                                underflow = value < scope.options.min;

                            if (overflow) {
                                needleValue = scope.options.max + 0.02 * scope.options.range;
                            }
                            else if (underflow){
                                needleValue = scope.options.min - 0.02 * scope.options.range;
                            }

                            var _currentRotation;

                            var targetRotation = toDegrees(needleValue) - 90;

                            var currentRotation = typeof _currentRotation !== 'undefined' ? _currentRotation : targetRotation;

                            _currentRotation = targetRotation;

                            return function (step) {
                                var rotation = currentRotation + (targetRotation - currentRotation) * step;
                                return 'translate(' + scope.options.cx + ', ' + scope.options.cy + ') rotate(' + rotation + ')';
                            };
                        }

                        var needleContainer = scope.svgCanvas.select('.needle-container');

                        needleContainer
                            .selectAll('text')
                            .attr('class', 'current-value')
                            .text(Math.round(value));

                        var needle = needleContainer.selectAll('path');
                        needle
                            .transition()
                            .duration(transitionDuration ? transitionDuration : scope.options.transitionDuration)
                            .attrTween('transform', transition);
                    };

                    function drawGauge (data) {

                        write(data.level, 5000);

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
