define('Controls-demo/Input/Date/RangeLinkLite', [
   'Core/Control',
   'wml!Controls-demo/Input/Date/RangeLinkLite',
   'css!Controls-demo/Input/Date/RangeLinkLite'
], function(
   BaseControl,
   template
) {
   'use strict';

   var ModuleClass = BaseControl.extend({
      _template: template,
      _startValueBind: new Date(2017, 0, 1),
      _endValueBind: new Date(2017, 0, 31),
      _startValue: new Date(2017, 0, 1),
      _endValue: new Date(2017, 0, 31),
      _startValueQuarter: new Date(2017, 0, 1),
      _endValueQuarter: new Date(2017, 2, 31),
      _startValueHalfYear: new Date(2017, 0, 1),
      _endValueHalfYear: new Date(2017, 5, 30),
      _startValueYear: new Date(2017, 0, 1),
      _endValueYear: new Date(2017, 11, 31),
      _checkedStart: new Date(2019, 3, 1),
      _checkedEnd: new Date(2020, 3, 1)
   });
   return ModuleClass;
});
