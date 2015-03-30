define('js!SBIS3.CONTROLS.hierarchyMixin', [], function () {
   /**
    * Позволяет контролу отображать данные имеющие иерархическую структуру и работать с ними.
    * @mixin SBIS3.CONTROLS.hierarchyMixin
    */
   var hierarchyMixin = /** @lends SBIS3.CONTROLS.hierarchyMixin.prototype */{
      $protected: {
         _openedPath: [],
         _ulClass: 'controls-TreeView__list',
         _options: {
            /**
             * @cfg {Boolean} Отображать сначала узлы, потом листья
             * @noShow
             */
            folderSort: false,
            /**
             * @cfg {String} Идентификатор узла, относительно которого надо отображать данные
             * @noShow
             */
            root: '',
            /**
             * @cfg {Boolean} При открытия узла закрывать другие
             * @noShow
             */
            singleExpand: '',
            /**
             * @cfg {String[]} Набор идентификаторов, обозначающих какую ветку надо развернуть при инициализации
             */
            openedPath: '',
            /**
             * @cfg {String} Поле иерархии
             */
            hierField: null,
            openType: 'nothing'
         }
      },
      $constructor: function () {

      },

      before : {
         //FixME: необходимо задать датасету поле иерархии, так как он еще не знает об этом
         _redraw : function () {
            this._dataSet.setHierField(this._options.hierField);
         }
      },

      /**
       * Установить корень выборки
       * @param {String} root Идентификатор корня
       */
      setRoot: function (root) {

      },
      /**
       * Открыть определенный путь
       * @param {String[]} path набор идентификаторов
       */
      setOpenedPath: function (path) {

      },
      /**
       * Раскрыть определенный узел
       * @param {String} key Идентификатор раскрываемого узла
       */
      openNode: function (key) {
         //must be implemented
      },
      /**
       * Закрыть определенный узел
       * @param {String} key Идентификатор раскрываемого узла
       */
      closeNode: function (key) {
         //must be implemented
      },

      /**
       * Закрыть или открыть определенный узел
       * @param {String} key Идентификатор раскрываемого узла
       */
      toggleNode: function (key) {
         //must be implemented
      },

      /*
       after : {
       _drawItems : function() {
       this._drawOpenedPath();
       }
       },

       _drawOpenedPath : function() {
       var self = this;
       if (this._options.openType == 'all') {
       this._items.iterate(function(item, key){
       self.openNode(key);
       });
       }
       else {
       for (var i = 0; i < this._openedPath.length; i++) {
       this.openNode(this._openedPath[i]);
       }
       }
       }
       */

   };

   return hierarchyMixin;

});