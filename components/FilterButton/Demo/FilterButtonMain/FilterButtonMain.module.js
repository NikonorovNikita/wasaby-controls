define('js!SBIS3.CONTROLS.Demo.FilterButtonMain', [
      'js!SBIS3.CORE.CompoundControl',
      'js!SBIS3.CONTROLS.FilterButton',
      'html!SBIS3.CONTROLS.Demo.FilterButtonMain',
      'js!SBIS3.CONTROLS.DataGrid',
      'css!SBIS3.CONTROLS.Demo.FilterButtonMain',
      'js!SBIS3.CONTROLS.Demo.FilterButtonFilterContent',
      'js!SBIS3.CONTROLS.Demo.FilterButtonMocks',
   ],
   function(CompoundControl, FilterButton, MainTpl) {
      var Main = CompoundControl.extend({
         _dotTplFn: MainTpl,

         $constructor: function() {
            var context = this.getLinkedContext();

            context.subscribe('onFieldsChanged', function() {
               var filter = this.getValue('filter');
               this.setValueSelf('filterJSON', JSON.stringify(filter));
            });

            context.setValueSelf('filter', {'NDS' : 1});
         }
      });

      return Main;
   }
);