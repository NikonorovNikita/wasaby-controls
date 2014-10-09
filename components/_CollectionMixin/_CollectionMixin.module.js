define('js!SBIS3.CONTROLS._CollectionMixin', ['js!SBIS3.CONTROLS.Collection', /*TODO для совместимости*/'js!SBIS3.CONTROLS.AdapterJSON'], function(Collection, AdapterJSON) {

   /**
    * Миксин, задающий любому контролу поведение работы с набором однотипных элементов.
    * @mixin SBIS3.CONTROLS._CollectionMixin
    */

   var _CollectionMixin = /**@lends SBIS3.CONTROLS._CollectionMixin.prototype  */{
      $protected: {
         _items : null,
         _dotItemTpl: null,
         _keyField : '',
         _options: {
            /**
             * @cfg {String} Поле элемента коллекции, которое является ключом
             * */
            keyField : null,
            /**
             * @cfg {Array} Набор исходных данных по которому строится отображение
             */
            items: undefined,
            /**
             * @cfg {} Шаблон отображения каждого элемента коллекции
             */
            itemTemplate: ''
         }
      },

      $constructor: function() {
         if (this._options.keyField) {
            this._keyField = this._options.keyField;
         }
         if (this._options.items) {
            if (this._options.items instanceof Collection) {
               this._items = this._options.items;
            }
            else {
               /*TODO Костыли для совместимости
               * позволяет передать в опции коллекцию в неявном виде*/
               this._initItems(this._options.items);
            }
         }
         else {
            this._initItems([]);
         }

      },

      /**
       * Возвращает коллекцию
       */
      getItems : function() {
         return this._items;
      },

      _initItems : function(items) {
         /*TODO Костыли для совместимости*/
         if (!this._keyField) {
            //пробуем взять первое поле из коллекции
            var item = items[0];
            if (item && Object.prototype.toString.call(item) === '[object Object]') {
               this._keyField = Object.keys(item)[0];
            }
         }
         this._items = new Collection({
            data: items,
            keyField: this._keyField,
            hierField: this._options.hierField,
            adapter : new AdapterJSON()
         });
      },

      setItems : function(items) {
         this._initItems(items);
         this._drawItems();
      },

      _drawItems: function(){
         var
            self = this,
            itemsContainer = this._getItemsContainer();
         itemsContainer.empty();

         this._items.iterate(function (item, key, i, parItem, lvl) {
            var
               oneItemContainer = self._getOneItemContainer(item, key, parItem, lvl),
               targetContainer = self._getTargetContainer(item, key, parItem, lvl);
            oneItemContainer.attr('data-id', key).addClass('controls-ListView__item');
            targetContainer.append(oneItemContainer);

            self._drawItem(oneItemContainer, item);

         });
         this._loadChildControls();
      },

      _getOneItemContainer : function(item, key) {
         return $('<div class="js-controls-ListView__itemContent"></div>');
      },

      _getTargetContainer : function() {
         //по стандарту все строки рисуются в itemsContainer
         return this._getItemsContainer();
      },

      /*TODO переопределяем метод compoundControl - костыль*/
      _loadControls: function(pdResult){
         return pdResult.done([]);
      },

      /*TODO свой механиз загрузки дочерних контролов - костыль*/
      _loadChildControls: function() {
         var def = new $ws.proto.Deferred();
         var self = this;
         self._loadControlsBySelector(new $ws.proto.ParallelDeferred(), undefined, '[data-component]')
            .getResult().addCallback(function () {
               def.callback();
            });
         return def;
      },

      _getItemsContainer: function(){
         return this._container;
      },

      _drawItem : function(itemContainer, item) {
         var resContainer = itemContainer.hasClass('js-controls-ListView__itemContent') ? itemContainer : $('.js-controls-ListView__itemContent', itemContainer);
         var
            def = new $ws.proto.Deferred(),
            itemTpl = this._options.itemTemplate;
         if (typeof itemTpl == 'string') {
            this._drawTpl(resContainer, item)
         }
         else if (typeof itemTpl == 'function') {
            var tplConfig = itemTpl.call(this, item);
            require([tplConfig.componentType], function(ctor){
               var config = tplConfig.config;
               config.element = resContainer;
               new ctor(config)
            })
         }
         return def;
      },

      _drawTpl : function(resContainer, item) {
         var id = resContainer.attr('data-id');
         resContainer.append(doT.template(this._options.itemTemplate)(item));
      }
   };

   return _CollectionMixin;

});