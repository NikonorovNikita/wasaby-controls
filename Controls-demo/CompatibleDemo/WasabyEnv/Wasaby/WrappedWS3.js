define('Controls-demo/CompatibleDemo/WasabyEnv/Wasaby/WrappedWS3',
   [
      'Core/Control',
      'wml!Controls-demo/CompatibleDemo/WasabyEnv/Wasaby/WrappedWS3',
      'Lib/Control/LayerCompatible/LayerCompatible',
   ],
   function(Control, template, CompatibleLayer) {
      'use strict';

      var WrappedWS3 = Control.extend({
         _template: template,
         _compatibleReady: false,
         _text: null,

         _beforeMount: function() {
            this._text = 'Wait...';
         },

         _afterMount: function() {
            var self = this;
            CompatibleLayer.load()
               .addCallback(function() {
                  self._compatibleReady = true;
                  self._text = 'Init success!';
                  self._forceUpdate();
               });
         },
         _setText: function(e, value) {
            this._text = value;
         },

         _setTextOld: function(e, value) {
            this.getTopParent()._logicParent._setText(e, value);
         },
      });
      WrappedWS3._styles = ['Controls-demo/CompatibleDemo/CompatibleDemo'];

      return WrappedWS3;
   }
);
