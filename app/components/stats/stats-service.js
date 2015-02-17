(function () {
    'use strict';

    /**
     * expects a date in format {year: '1999', month: '1-12', day: '1-31'}
     * returns a moment.
     * @param mongoDate
     * @returns {*}
     * @private
     */
    function _getMomentFromMongoDate(mongoDate) {
        return moment([mongoDate.year, mongoDate.month - 1, mongoDate.day]);
    }



    function fillAndFormatMongoDateSeries(sourceData, options) {
        var _indexingDateFormat = 'l';

        var indexedValues = _.indexBy(sourceData, function (update) {
            return _getMomentFromMongoDate(update.date).format(_indexingDateFormat);
        });

        var moments = _.map(_.keys(indexedValues), function (formatted) {
            return moment(formatted, _indexingDateFormat);
        });

        var oldestDataDate = moment.min(moments);
        var newestDataDate = moment.max(moments);

        options = _.defaults(options, {
            propsToPlot: ['count'],
            runningTotal: false,
            newestDay: newestDataDate,
            oldestDay: options.nrOfDaysToPlot ? moment(options.newestDay || newestDataDate).subtract(options.nrOfDaysToPlot,'days') : oldestDataDate,
            dateFormat: 'D.',
            reverseX: false,
            colors: ['#F4BA14', '#ff5252', '#0277bd'],
            colorFn: function (index) {
                var colors = options.colors;
                return colors && colors.length >= index ? colors[index] : '#aaa'
            }
        });

        var propsToPlot = options.propsToPlot;

        var myChartData = {
            "series": propsToPlot,
            "data": [ ],
            nv: _.map(propsToPlot, function (key, index) {
                return { key: options.legend ? options.legend[index] : key, values: [], color: options.colorFn(index), area: false }
            })
        };

        // start with the newest data
        var current = options.newestDay;

        // set the Until a bit before the start date, so the isAfter in the loop catches the last day
        var showUntil = options.oldestDay.startOf('day').subtract(1, 'second');

        var runningTotal = 0;

        if (options.runningTotal) {
            runningTotal = _.reduce(sourceData, function (sum, value) {
                for (var i = 0; i < propsToPlot.length; i++) {
                    sum[i] = (sum[i] || 0) + value[propsToPlot[i]];
                }
                return sum;
            }, []);
        }

        while (current.isAfter(showUntil)) {
            var curIndex = current.format(_indexingDateFormat);
            var values = [];
            for (var i = 0; i < propsToPlot.length; i++) {
                if (runningTotal) {
                    values.push(runningTotal[i]);
                    if (indexedValues[curIndex]) {
                        runningTotal[i] = runningTotal[i] - indexedValues[curIndex][propsToPlot[i]];
                    }
                } else {
                    values.push((indexedValues[curIndex] && indexedValues[curIndex][propsToPlot[i]]) || 0);
                }

                var key = options.legend && options.legend[i] ? options.legend[i] : propsToPlot[i];
                _.find(myChartData.nv, { key: key }).values.push([current.toDate().getTime(), indexedValues[curIndex] ? indexedValues[curIndex][propsToPlot[i]] || 0 : 0]);

            }
            if (options.reverseX) {
                myChartData.data.push({
                    x: current.format(options.dateFormat),
                    y: values});
            } else {
                myChartData.data.unshift({
                    x: current.format(options.dateFormat),
                    y: values});
            }
            current.subtract(1, 'day');
        }
        return myChartData;
    }



    angular.module('yp.components.stats', ['yp.components.user'])

        .factory('StatsService', ['Restangular', '$translate',
            function (Restangular, $translate) {
                var statsService = {};

                statsService.loadStats = function (campaignId, options) {
                    if (!options) {
                        options = {type: 'all', scopeType: 'campaign', scopeId: campaignId};
                    }
                    return Restangular.all('stats').getList(options);
                };

                statsService.fillAndFormatForPlot = fillAndFormatMongoDateSeries;

                function _getRatingsCount(results, type, rating) {
                    return ( _.find(results[0][type], { rating: rating } ) || {} ).count  || 0;
                }

                function _ratingValue(rating, ratings, sum) {
                    return [ $translate.instant('end-of-campaign.eventsRatings.' + rating), ratings[rating] / sum ];
                }

                statsService.getRatingsStats = function (scopeType, scopeId) {
                    return statsService.loadStats(scopeId,
                        {
                            type: 'eventsRatings',
                            scopeType: scopeType,
                            scopeId: scopeId
                        })
                        .then(function (results) {

                            var type = 'eventsRatings';

                            var ratings = {
                                1: _getRatingsCount(results, type, 1),
                                3: _getRatingsCount(results, type, 3),
                                5: _getRatingsCount(results, type, 5)
                            };
                            var sum = _.reduce(ratings, function (result, num, key) {
                                return result + num;
                            });


                           return {
                                "key": $translate.instant('end-of-campaign.eventsRatings.campaign'),
                                "values": [
                                    _ratingValue(1, ratings, sum),
                                    _ratingValue(3, ratings, sum),
                                    _ratingValue(5, ratings, sum)
                                ]
                            };

                        });
                };

                return statsService;
            }]);

})();