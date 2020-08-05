define(['Controls/toggle'], function(toggle) {
   'use strict';
   var separator;
   describe('Controls/Button/Separator', function() {
      function destroySeparator() {
         separator._isDestroyedFromCore = true;
         separator.destroy();
         separator = undefined;
      }

      it('counter open state', function() {
         separator = new toggle.Separator();
         var opt = {
            value: true
         };
         separator.saveOptions(opt);
         separator._beforeMount(opt);
         assert.isTrue(separator._icon === 'icon-CollapseLight ', 'icon style generate incorrect');
         destroySeparator();
      });

      it('counter close state', function() {
         separator = new toggle.Separator();
         var opt = {
            value: false
         };
         separator.saveOptions(opt);
         separator._beforeMount(opt);
         assert.isTrue(separator._icon === 'icon-ExpandLight ', 'icon style generate incorrect');
         destroySeparator();
      });

      it('update counter open state to close state', function() {
         separator = new toggle.Separator();
         var opt = {
            value: true
         };
         var newOpt = {
            value: false
         };
         separator.saveOptions(opt);
         separator._beforeUpdate(newOpt);
         assert.isTrue(separator._icon === 'icon-ExpandLight ', 'icon style generate incorrect');
         destroySeparator();
      });

      it('update counter close state to open state', function() {
         separator = new toggle.Separator();
         var opt = {
            value: false
         };
         var newOpt = {
            value: true
         };
         separator.saveOptions(opt);
         separator._beforeUpdate(newOpt);
         assert.isTrue(separator._icon === 'icon-CollapseLight ', 'icon style generate incorrect');
         destroySeparator();
      });
   });
});