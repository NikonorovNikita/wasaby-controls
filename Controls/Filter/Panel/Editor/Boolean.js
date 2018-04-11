define('Controls/Filter/Panel/Editor/Boolean', [
   'Core/Control',
   'tmpl!Controls/Filter/Panel/Editor/Boolean/BooleanEditor'

   // 'css!Controls/Filter/Panel/Panel'
], function(Control, template) {

   'use strict';

   var BooleanEditor = Control.extend({
      _template: template,

      constructor: function(cfg) {
         BooleanEditor.superclass.constructor.apply(this, arguments);
      },

      _clickHandler: function() {
         this._options.item.value = !this._options.item.value;

      }

   });

   return BooleanEditor;

});
