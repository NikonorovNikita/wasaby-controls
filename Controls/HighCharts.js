define('Controls/HighCharts', [
   'Core/Control',
   'tmpl!Controls/HighCharts/HighCharts',
   'Controls/HighCharts/resources/ParseDataUtil',
   'Core/ILogger',
   'Core/core-clone'
], function(Control, template, ParseDataUtil, ILogger, cClone) {

   /**
    * Component HighCharts
    * @class Controls/HighCharts
    * @extends Core/Control
    * @mixes Controls/interface/IHighCharts
    * @control
    * @authors Volotskoy V.D., Sukhoruchkin A.S.
    */

   /**
    * @typedef {Object} chartType
    * @variant line Line chart
    * @variant spline Polynomial line chart
    * @variant pie Pie chart
    * @variant column Column chart
    * @variant bar Column horizontal chart
    * @variant area Area chart
    * @variant areaspline Polynomial area chart
    * @variant scatter Dot chart
    * @variant arearange Interval chart
    * @variant areasplinerange Polynomial interval chart
    */

   /**
    * @typedef {Object} wsSeries
    * @property {chartType} [type=line] Type of chart
    * @property {string} name Chart name
    * @property {string} sourceFieldX Source field for X axis (For pie charts - for title of slice)
    * @property {string} sourceFieldY Source field for Y axis (For pie charts - for value of slice)
    * @property {string} sourceField_3 Source field for intervals (For pie charts - for color of slice)
    * @property {string} color Color of chart
    * @property {Number} xAxis Number of related X axis
    * @property {Number} yAxis Number of related Y axis
    */

   /**
    * @typedef {Object} typeAxis
    * @variant xAxis Horizontal axis
    * @variant yAxis Vertical axis
    */

   /**
    * @typedef {Object} wsAxis
    * @property {typeAxis} [type=xAxis] Type of axis
    * @property {String} sourceField Source data field
    * @property {String} title Title
    * @property {Number} [gridLineWidth=0] Line width of grid
    * @property {function} labelsFormatter Render function for labels
    * @property {Number} [staggerLines=0] Quantity of lines for label render
    * @property {Number} [step=0] Step for label sign
    * @property {Number} [lineWidth=1] LineWidth
    * @property {Boolean} [allowDecimals=true] Allow decimals value
    * @property {Number} min Minimal value
    * @property {Number} max Maximum value
    * @property {Boolean} opposite Place axis opposite standart position
    * @property {Number} linkedTo Number of related axis
    * @translatable title
    */

   /**
    * @name Controls/HighCharts#wsSeries
    * @cfg {wsSeries[]} Array of charts
    */

   /**
    * @name Controls/HighCharts#wsAxis
    * @cfg {wsAxis[]} Array of axis
    */


   var _private = {
         redraw: function(self, wsSeries, wsAxis, recordSet) {
            var preparedData = _private.prepareData(wsSeries, wsAxis, recordSet);
            _private.drawChart(self, preparedData);
         },
         drawChart: function(self, preparedData) {
            self._chartOptions = _private.mergePreparedData(self._chartOptions, preparedData);
         },
         prepareData: function(wsSeries, wsAxis, recordSet) {
            var
               preparedSeries,
               tmpXAxis,
               tmpYAxis,
               tmpResult,
               parseRsResult;

            preparedSeries = ParseDataUtil.recordSetParse(wsSeries, recordSet);
            
            tmpResult = ParseDataUtil.parseAxisCommon(wsAxis);
            
            tmpXAxis = tmpResult.xAxis;
            tmpYAxis = tmpResult.yAxis;
            
            parseRsResult =  ParseDataUtil.recordSetParseAxis(tmpXAxis, tmpYAxis, recordSet);

            return {
               series: preparedSeries,
               xAxis: parseRsResult.xAxis,
               yAxis: parseRsResult.yAxis
            };
         },
         mergePreparedData: function(chartOptions, preparedData) {
            var tmpOpts = cClone(chartOptions);
            tmpOpts.series = preparedData.series;
            tmpOpts.xAxis = preparedData.xAxis;
            tmpOpts.yAxis = preparedData.yAxis;
            return tmpOpts;
         }
      },
      HighCharts = Control.extend({
         _template: template,
         _chartOptions: {},
         _highChartsRecordSet: null,

         _beforeMount: function(opts, context, receivedState) {
            var self = this;
            this._chartOptions = opts.chartOptions;
            if (receivedState) {
               this._highChartsRecordSet = receivedState;
            } else if (opts.dataSource) {
               return opts.dataSource.query(opts.filter).addCallback(function(data) {
                  self._highChartsRecordSet = data.getAll();
                  return self._highChartsRecordSet;
               });
            }
         },

         _afterMount: function(opts) {
            if (this._highChartsRecordSet) {
               _private.redraw(this, opts.wsSeries, opts.wsAxis, this._highChartsRecordSet);

               //Have to call forceUpdate in afterMount, because afterMount can`t update children components
               this._forceUpdate();
            }
         },

         _beforeUpdate: function(opts) {
            var self = this;
            if (opts.filter !== this._options.filter && opts.dataSource) {
               opts.dataSource.query(opts.filter).addCallback(function(data) {
                  if (data) {
                     _private.redraw(self, opts.wsSeries, opts.wsAxis, data.getAll());
                  }
               });
            }
         }
      });

   return HighCharts;
});
