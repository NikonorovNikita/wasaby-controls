define('Controls-demo/MasterDetail/Demo', [
   'Core/Control',
   'tmpl!Controls-demo/MasterDetail/Demo',
   'Controls-demo/MasterDetail/Data',
   'Core/core-clone',
   'WS.Data/Source/Memory',
   'tmpl!Controls-demo/MasterDetail/itemTemplates/masterItemTemplate',
   'Controls-demo/MasterDetail/DemoSource',
   'css!Controls-demo/MasterDetail/Demo'
], function(Control, template, data, cClone, Memory, itemTemplate, DemoSource) {
   return Control.extend({
      _template: template,


      _beforeMount: function() {
         this._detail = {};

         this._detailSource = new DemoSource();

         this._masterSource = new Memory({
            idProperty: 'id',
            data: cClone(data.master)
         });
      },

      gridColumns: [
         {
            displayProperty: 'name',
            width: '1fr',
            template: itemTemplate
         }
      ]
   });
});
