define(['Controls/heading'], function(heading) {
   'use strict';
   var separator;
   describe('Controls/_heading/BackButton', function() {
      it('_beforeMount', function() {
         var backB = new heading.Back(),
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
         var backB = new heading.Back(),
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
            backB._beforeUpdate(opt);
            assert.equal(backB._style, setOfStyle.stateStyle, 'uncorrect style in _beforeMount');
         });
         backB.destroy();
      });
   });
});
