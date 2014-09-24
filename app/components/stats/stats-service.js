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
            dateFormat: 'D.M.',
            reverseX: false
        });

        var propsToPlot = options.propsToPlot;

        var myChartData = {
            "series": propsToPlot,
            "data": [ ]
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

        .factory('StatsService', ['Restangular',
            function (Restangular) {
                var statsService = {};

                statsService.loadStats = function (campaignId, options) {
                    if (!options) {
                        options = {type: 'all', scopeType: 'campaign', scopeId: campaignId};
                    }
                    return Restangular.all('stats').getList(options);
                };

                statsService.fillAndFormatForPlot = fillAndFormatMongoDateSeries;

                return statsService;
            }]);

})();