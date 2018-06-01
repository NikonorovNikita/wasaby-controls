define('Controls/List/Grid/GridView', [
   'Controls/List/ListView',
   'tmpl!Controls/List/Grid/GridView',
   'tmpl!Controls/List/Grid/Item',
   'tmpl!Controls/List/Grid/Column',
   'tmpl!Controls/List/Grid/HeaderContent',
   'Core/detection',
   'tmpl!Controls/List/Grid/Header',
   'tmpl!Controls/List/Grid/Results',
   'tmpl!Controls/List/Grid/ColGroup',
   'css!Controls/List/Grid/Grid',
   'css!Controls/List/Grid/OldGrid',
   'Controls/List/BaseControl/Scroll/Emitter'
], function(ListView, GridTpl, DefaultItemTpl, ColumnTpl, HeaderContentTpl, cDetection) {

   'use strict';

   var
      _private = {
         prepareGridTemplateColumns: function(columns, multiselect) {
            var
               result = '';
            if (multiselect) {
               result += 'auto ';
            }
            columns.forEach(function(column) {
               result += column.width ? column.width + ' ' : '1fr ';
            });
            return result;
         },
         prepareColumnsIfPartialGridSupport: function(columns) {
            for (var i = 0; i < columns.length; i++) {
               if (columns[i].width === '1fr') {
                  columns[i].width = 'auto';
               } else if (columns[i].width === 'auto') {
                  columns[i].width = '1px';
               }
            }
         },
         prepareHeaderAndResultsIfFullGridSupport: function(results, header, container) {
            var
               resultsPadding,
               cells;
            if (results) {
               if (results.position === 'top') {
                  if (header) {
                     resultsPadding = this._container.getElementsByClassName('controls-Grid__header-cell')[0].getBoundingClientRect().height + 'px';
                  } else {
                     resultsPadding = '0';
                  }
               } else {
                  resultsPadding = 'calc(100% - ' + this._container.getElementsByClassName('controls-Grid__results-cell')[0].getBoundingClientRect().height + 'px)';
               }
               cells = container.getElementsByClassName('controls-Grid__results-cell');
               Array.prototype.forEach.call(cells, function(elem) {
                  elem.style.top = resultsPadding;
               });
            }
         }
      },
      GridView = ListView.extend({
         _template: GridTpl,
         _defaultItemTemplate: DefaultItemTpl,
         _headerContentTemplate: HeaderContentTpl,
         _prepareGridTemplateColumns: _private.prepareGridTemplateColumns,
         isNotFullGridSupport: cDetection.isNotFullGridSupport,
         isIE: cDetection.isIE,
         isSafari11: cDetection.safari11,

         _beforeMount: function(cfg) {
            GridView.superclass._beforeMount.apply(this, arguments);
            this._listModel.setColumnTemplate(ColumnTpl);
            if (cDetection.isNotFullGridSupport) {
               _private.prepareColumnsIfPartialGridSupport(cfg.columns);
            }
         },

         _afterMount: function() {
            GridView.superclass._afterMount.apply(this, arguments);
            if (!cDetection.isNotFullGridSupport) {
               _private.prepareHeaderAndResultsIfFullGridSupport(this._listModel.getResults(), this._listModel.getHeader(), this._container);
            }
         }
      });

   GridView._private = _private;

   return GridView;
});
