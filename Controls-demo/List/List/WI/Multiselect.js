define('Controls-demo/List/List/WI/Multiselect', [
   'Core/Control',
   'wml!Controls-demo/List/List/WI/resources/Multiselect'
], function(Control, template) {
   'use strict';

   return Control.extend({
      _template: template
   });
});
