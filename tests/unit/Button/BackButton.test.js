define(['Controls/Heading/Back'], function(BackBtn) {
   'use strict';
   var separator;
   describe('Controls/Heading/BackButton', function() {
      it('_beforeMount', function() {
         var backB = new BackBtn(),
            opt = {
               style: ''
            },
            styles = [
               {
                  optionStyle: 'test',
                  stateStyle: 'test'
               },
               {
                  optionStyle: 'default',
                  stateStyle: 'primary'
               }
            ];
         styles.forEach(function(setOfStyle) {
            opt.style = setOfStyle.optionStyle;
            backB._beforeMount(opt);
            assert.equal(backB._style, setOfStyle.stateStyle, 'uncorrect style in _beforeMount');
         });
         backB.destroy();
      });
      it('_beforeUpdate', function() {
         var backB = new BackBtn(),
            opt = {
               style: ''
            },
            styles = [
               {
                  optionStyle: 'test',
                  stateStyle: 'test'
               },
               {
                  optionStyle: 'primary',
                  stateStyle: 'secondary'
               }
            ];
         styles.forEach(function(setOfStyle) {
            opt.style = setOfStyle.optionStyle;
            backB._beforeUpdate(opt);
            assert.equal(backB._style, setOfStyle.stateStyle, 'uncorrect style in _beforeMount');
         });
         backB.destroy();
      });
   });
});
