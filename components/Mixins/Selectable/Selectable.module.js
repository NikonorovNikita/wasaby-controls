/**
 * Created by iv.cheremushkin on 14.08.2014.
 */

define('js!SBIS3.CONTROLS.Selectable', ['js!SBIS3.CONTROLS.Data.Utils', 'js!SBIS3.CONTROLS.Data.Bind.ICollection'], function(Utils, IBindCollection) {

   /**
    * Миксин, добавляющий поведение хранения выбранного элемента. Всегда только одного.
    * @mixin SBIS3.CONTROLS.Selectable
    * @author Крайнов Дмитрий Олегович
    * @public
    */

   var Selectable = /**@lends SBIS3.CONTROLS.Selectable.prototype  */{
       /**
        * @event onSelectedItemChange При смене выбранных элементов
        * @param {$ws.proto.EventObject} eventObject Дескриптор события.
        * @param {String} id Идентификатор выбранного пункта.
        * @example
        * <pre>
        *     RadioButtonGroup.subscribe('onSelectedItemChange', function(event, id){
        *        TextBox.setText('Selected item id: ', id);
        *     })
        * </pre>
        * @see selectedKey
        * @see setSelectedKey
        * @see getSelectedKey
        * @see SBIS3.CONTROLS.DSMixin#keyField
        */
      $protected: {
         _selectMode: 'index',
          _options: {
             /**
              * @cfg {String} Индекс(номер) выбранного элемента
              * @remark
              * Для задания выбранного элемента необходимо указать номер элемента коллекции.
              * @example
              * <pre>
              *     <option name="selectedIndex">1</option>
              * </pre>
              * @see setSelectedIndex
              * @see getSelectedIndex
              * @see onSelectedItemChange
              */
             selectedIndex: null,
             /**
              * @cfg {String} Идентификатор выбранного элемента
              * @remark
              * Для задания выбранного элемента необходимо указать значение {@link SBIS3.CONTROLS.DSMixin#keyField ключевого поля} элемента коллекции.
              * @example
              * <pre>
              *     <option name="selectedKey">3</option>
              * </pre>
              * @see setSelectedKey
              * @see getSelectedKey
              * @see onSelectedItemChange
              */
             selectedKey: null,
             /**
              * @cfg {Boolean} Разрешить отсутствие выбранного элемента в группе
              * @example
              * <pre>
              *     <option name="allowEmptySelection">false</option>
              * </pre>
              * @remark
              * Опция нужна, например, для создания пустой группы радиокнопок - без выбранного элемента.
              * При этом после задания значения вернуть коллекцию к состоянию без выбранного элемента можно только
              * методом {@link setSelectedKey}.
              * @see selectedKey
              * @see setSelectedKey
              * @see getSelectedKey
              * @see SBIS3.CONTROLS.DSMixin#keyField
              */
            allowEmptySelection : true
         }
      },

      $constructor: function() {
         this._publish('onSelectedItemChange');
      },


      _prepareSelectedConfig: function(index, key) {




         // FIXME key !== null && index === -1 - проверка для выпуска 3.7.3.100
         // иначе, если сначала установить ключ, а потом сорс не будет отрисовываться выбранный эелемент
         if ((typeof index == 'undefined') || (index === null) || (key !== null && index === -1)) {
            if (typeof key != 'undefined') {
               this._selectMode = 'key';
               this._options.selectedIndex = this._getItemIndexByKey(key);
            }
            else {
               this._options.selectedIndex = undefined;
            }
         }
         else {
            this._selectMode = 'index';
            if (this._itemsProjection.getCount()) {
               this._options.selectedIndex = index;
            }
            else {
               this._options.selectedIndex = undefined;
            }
         }
         if (!this._options.allowEmptySelection && (this._options.selectedIndex === null || typeof this._options.selectedIndex == 'undefined' || this._options.selectedIndex == -1)) {
            if (this._itemsProjection.getCount()) {
               this._selectMode = 'index';
               this._options.selectedIndex = 0;
            }
         }
      },

      before : {
         setDataSource: function() {
            this._options.selectedIndex = -1;
         },
         setItems: function() {
            this._options.selectedIndex = -1;
         },
         destroy: function () {
            if (this._utilityEnumerator) {
               this._utilityEnumerator.unsetObservableCollection(
                  this._itemsProjection
               );
            }
            this._utilityEnumerator = undefined;
         }
      },

      after : {
         _setItemsEventHandlers : function() {
            if (!this._onProjectionCurrentChange) {
               this._onProjectionCurrentChange = onProjectionCurrentChange.bind(this);
            }
            this.subscribeTo(this._itemsProjection, 'onCurrentChange', this._onProjectionCurrentChange);

            if (!this._onProjectionChange) {
               this._onProjectionChange = onCollectionChange.bind(this);
            }
            this.subscribeTo(this._itemsProjection, 'onCollectionChange', this._onProjectionChange);
         },
         _drawItemsCallback: function() {
            this._drawSelectedItem(this._options.selectedKey, this._options.selectedIndex);
         },
         _unsetItemsEventHandlers : function() {
            if (this._utilityEnumerator) {
               this._utilityEnumerator.unsetObservableCollection(
                  this._itemsProjection
               );
            }
            this._utilityEnumerator = undefined;
            if (this._itemsProjection && this._onProjectionCurrentChange) {
               this.unsubscribeFrom(this._itemsProjection, 'onCurrentChange', this._onProjectionCurrentChange);
            }
            if (this._itemsProjection && this._onProjectionChange) {
               this.unsubscribeFrom(this._itemsProjection, 'onCollectionChange', this._onProjectionChange);
            }
         },
         _itemsReadyCallback: function() {
            this._prepareSelectedConfig(this._options.selectedIndex, this._options.selectedKey);
            if ((typeof this._options.selectedIndex != 'undefined') && (this._options.selectedIndex !== null)) {
               this._itemsProjection.setCurrentPosition(this._options.selectedIndex);
            }
            else {
               this._itemsProjection.setCurrentPosition(-1);
            }
         }
      },

      _getUtilityEnumerator: function() {
         if (!this._utilityEnumerator) {
            this._utilityEnumerator = this._itemsProjection.getEnumerator();
            this._utilityEnumerator.setObservableCollection(this._itemsProjection);
         }
         return this._utilityEnumerator;
      },


      //TODO переписать метод
      _setSelectedIndex: function(index, id) {
         this._drawSelectedItem(id, index);
         this._notifySelectedItem(id, index)
      },
      /**
       * Установить выбранный элемент по идентификатору
       * @remark
       * Для возвращения коллекции к состоянию без выбранного элемента нужно передать null.
       * @param {String} id Идентификатор элемента, который нужно установить в качестве выбранного.
       * @example
       * <pre>
       *     var newKey = (someValue > 0) ? 'positive' : 'negative';
       *     myComboBox.setSelectedKey(newKey);
       * </pre>
       * @see selectedKey
       * @see getSelectedKey
       * @see SBIS3.CONTROLS.DSMixin#keyField
       * @see onSelectedItemChange
       */
      setSelectedKey : function(id) {
         this._options.selectedKey = id;
         if (this._itemsProjection) {
            this._prepareSelectedConfig(undefined, id);
            if ((typeof this._options.selectedIndex != 'undefined') && (this._options.selectedIndex !== null)
               && (typeof this._itemsProjection.at(this._options.selectedIndex) != 'undefined')) {
               this._itemsProjection.setCurrentPosition(this._options.selectedIndex);
            }
            else {
               this._itemsProjection.setCurrentPosition(-1);
            }
         } else {
            this._setSelectedIndex(null, id);
         }
      },

      setSelectedIndex: function(index) {
         if (this._itemsProjection) {
            this._prepareSelectedConfig(index);
            this._itemsProjection.setCurrentPosition(index);
         }
      },
      /**
       * Возвращает идентификатор выбранного элемента.
       * @example
       * <pre>
       *     var key = myComboBox.getSelectedKey();
       *     if (key !== 'old') {
       *        myComboBox.setSelectedKey('newKey');
       *     }
       * </pre>
       * @see selectedKey
       * @see setSelectedKey
       * @see onSelectedItemChange
       * @see SBIS3.CONTROLS.DSMixin#keyField
       */
      getSelectedKey : function() {
         return this._options.selectedKey;
      },

      /**
       * Возвращает индекс выбранного элемента.
       * @see selectedIndex
       * @see setselectedIndex
       * @see onSelectedItemChange
       */
      getSelectedIndex : function() {
         return this._options.selectedIndex;
      },

      _drawSelectedItem : function() {
         /*Method must be implemented*/
      },

      _getItemValue: function(value, keyField) {
         if(value && typeof value === 'object') {
            return Utils.getItemPropertyValue(value, keyField );
         }
         return value;
      },

      _getItemIndexByKey: function(id) {
         if(this._options.keyField) {
            return this._getUtilityEnumerator().getIndexByValue(
               this._options.keyField,
               id
            );
         } else {
            var index;
            this._itemsProjection.each(function(value, i){
               if(value.getContents() === id){
                  index = i;
               }
            });
            return index;
         }
      },

      _notifySelectedItem : function(id, index) {
         this._notifyOnPropertyChanged('selectedKey');
         this._notifyOnPropertyChanged('selectedIndex');
         this._notify('onSelectedItemChange', id, index);
      }
   };

   var onCollectionChange = function (event, action, newItems, newItemsIndex, oldItems) {
      switch (action) {
         case IBindCollection.ACTION_ADD:
         case IBindCollection.ACTION_REMOVE:
         case IBindCollection.ACTION_MOVE:
         case IBindCollection.ACTION_REPLACE:
         case IBindCollection.ACTION_RESET:
            var count = this._itemsProjection.getCount();
            if (this._options.selectedIndex > this._itemsProjection.getCount() - 1) {
               this._options.selectedIndex = (count > 0) ? count - 1 : -1;
            }
            var item = this._itemsProjection.at(this._options.selectedIndex);
            if (item) {
               this._options.selectedKey = item.getContents().getId();
               this._setSelectedIndex(this._options.selectedIndex, this._options.selectedKey);
            }
      }
   };

   var onProjectionCurrentChange = function (event, newCurrent, oldCurrent, newPosition) {
      this._setSelectedIndex(
         newPosition,
         this._getItemValue(newCurrent ? newCurrent.getContents() : null, this._options.keyField)
      );
   };

   return Selectable;

});