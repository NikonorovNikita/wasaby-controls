/**
 * Created by as.suhoruchkin on 12.03.2015.
 */
define('js!SBIS3.CONTROLS.OperationsPanel', [
   'js!SBIS3.CORE.CompoundControl',
   'html!SBIS3.CONTROLS.OperationsPanel',
   'js!SBIS3.CONTROLS.PickerMixin',
   'js!SBIS3.CONTROLS.CollectionMixin',
   /*TODO это должна подключать не панель а прекладники, потом убрать*/
   'js!SBIS3.CONTROLS.OperationDelete',
   'js!SBIS3.CONTROLS.OperationsMark'
], function(Control, dotTplFn, PickerMixin, CollectionMixin) {
   /**
    * SBIS3.CONTROLS.OperationsPanel
    * @class SBIS3.CONTROLS.OperationsPanel
    * @extends $ws.proto.CompoundControl
    * @control
    * @public
    */
   var OperationsPanel = Control.extend([CollectionMixin, PickerMixin],/** @lends SBIS3.CONTROLS.OperationsPanel.prototype */{
      _dotTplFn: dotTplFn,
       /**
        * @typedef {Object} Type
        * @property {Boolean} mass Массовые операции.
        * @property {Boolean} mark Операции отметки.
        * @property {Boolean} selection Операции над выбранными записями.
        */
       /**
        * @typedef {Object} Items
        * @property {String} name Имя кнопки панели массовых операций.
        * @property {String} componentType Тип компонента, определяющий формат.
        * @property {Type} type Тип операций.
        * @property {Object} options Настройки компонента, переданного в componentType.
        *
        */
       /**
        * @cfg {Items[]} Набор исходных данных, по которому строится отображение
        * @name SBIS3.CONTROLS.OperationsPanel#items
        * @example
        * <pre>

        * </pre>
        * @see keyField
        */
      $protected: {
         _options: {
             /**
              * @cfg {String} Имя связанного представления данных
              * @example
              * <pre>
              *     <option name="linkedView">MyDataGrid</option>
              * </pre>
              * @see setLinkedView
              * @see getLinkedView
              * @editor InternalComponentChooser
              */
            linkedView: undefined,
             /**
              * @noShow
              */
            keyField: 'name'
         },
         _blocks: undefined,
         _selectedCount: undefined,
         _currentMode: undefined
      },

      $constructor: function() {
         this._blocks = {
            wrapper: this._container.find('.controls__operations-panel__wrapper'),
            markOperations: this._container.find('.controls__operations-panel__actions-mark'),
            allOperations: this._container.find('.controls__operations-panel__actions'),
            closedButton: this._container.find('.controls__operations-panel__closed'),
            openedButton: this._container.find('.controls__operations-panel__opened')
         };
         this._initHandlers();
         this._bindPanelEvents();
         this.setLinkedView(this._options.linkedView);
      },
      _drawItemsCallback: function() {
         this._itemsDrawn = true;
      },
       /**
        * Метод установки или замены имени связанного представления данных, установленного в опции {@link linkedView}.
        * @param linkedView
        */
      setLinkedView: function(linkedView) {
         if ($ws.helpers.instanceOfModule(linkedView, 'SBIS3.CONTROLS.DataGrid')) {
            this._reassignView(linkedView);
            this.togglePicker();
            this._setMode();
            this._setVisibleMarkBlock();
         }
      },
       /**
        * Метод получения имени связанного представления данных, установленного либо в опции {@link linkedView},
        * либо методом {@link setLinkedView}.
        * @returns {String} Возвращает имя связанного представления данных.
        * @see linkedView
        * @see setLinkedView
        */
      getLinkedView: function() {
         return this._options.linkedView;
      },
      _reassignView: function(linkedView) {
         if (this._options.linkedView) {
            this._options.linkedView.unsubscribe('onSelectedItemsChange', this._handlers.onChangeSelection);
         }
         this._options.linkedView = linkedView;
         this._selectedCount = linkedView.getSelectedItems().length;
         if (this._options.linkedView) {
            this._options.linkedView.subscribe('onSelectedItemsChange', this._handlers.onChangeSelection);
         }
      },
      _initHandlers: function() {
         this._handlers = {
            onChangeSelection: this._onChangeSelection.bind(this)
            /*TODO тут ещё будут обработчики, так что считаю целесообразно оставить такой блок*/
         };
      },
      _onChangeSelection: function() {
         this._selectedCount = this._options.linkedView.getSelectedItems().length;
         this.togglePicker();
         this._setMode();
      },
      _bindPanelEvents: function() {
         this._blocks.closedButton.bind('click', this.showPicker.bind(this));
         this._blocks.openedButton.bind('click', this.hidePicker.bind(this));
      },
      showPicker: function() {
         if (this.isEnabled() && this.getLinkedView()) {
            if (!this._itemsDrawn) {
               this._drawItems();
            }
            OperationsPanel.superclass.showPicker.apply(this);
         }
      },
      togglePicker: function() {
         if (!!this._selectedCount !== this._pickerIsVisible()) {
            OperationsPanel.superclass.togglePicker.apply(this);
         }
      },
      _pickerIsVisible: function() {
         return !!this._picker && this._picker.isVisible()
      },
      /*TODO перенести данную логику на уровень PickerMixin*/
      hide: function() {
         this.hidePicker();
         OperationsPanel.superclass.hide.apply(this, arguments);
      },
      _setMode: function() {
         this._currentMode = !!this._selectedCount;
         this._blocks.wrapper.toggleClass('controls__operations-panel__mass-mode',  !this._currentMode).toggleClass('controls__operations-panel__selection-mode',  this._currentMode);
      },
      /*TODO чья это ответственность? OperationsPanel или OperationsMark*/
      _setVisibleMarkBlock: function() {
         this._blocks.markOperations.toggleClass('ws-hidden', !this._options.linkedView._options.multiselect);
      },
      _setPickerContent: function() {
         this._picker.getContainer().append(this._blocks.wrapper);
         this._blocks.wrapper.removeClass('ws-hidden');
      },
      _setPickerConfig: function () {
         return {
            corner: 'tl',
            target: this
         };
      },
      _getTargetContainer: function(item) {
         var type = item.type.mark ? 'mark' : 'all';
         return this._blocks[type + 'Operations'];
      },
      _getItemTemplate: function() {
         return function (cfg) {
            var type = this._getButtonType(cfg.type);
            cfg.options = cfg.options || {};
            cfg.options.className = 'controls__operations-panel__action-type-' + type;
            cfg.options.name = cfg.name;
            return {
               componentType: cfg.componentType,
               config: cfg.options
            };
         }
      },
      _getButtonType: function (type) {
         return type.mark ? 'mark' : type.mass && type.selection ? 'all' : type.mass ? 'mass' : 'selection';
      },
       /**
        * Установить возможность взаимодействия с панелью массовых операций.
        * @param enabled
        */
      setEnabled: function(enabled) {
         if (!enabled) {
            this.hidePicker();
         }
         OperationsPanel.superclass.setEnabled.apply(this, arguments);
      },
       /**
        *
        * @returns {*}
        */
      getItemInstance: function() {
         if (!this._itemsDrawn) {
            this._drawItems();
         }
         return OperationsPanel.superclass.getItemInstance.apply(this, arguments);
      },
       /**
        * Получить состояние панели.
        * Состояние панели информирует о режиме работы с записями связанного представления данных.
        * @returns {Boolean} Состояние панели массовых операций.
        * Возможные значения:
        * <ol>
        *    <li>true - управление отмеченными записями,</li>
        *    <li>false - управление всеми записями.</li>
        * </ol>
        */
      getPanelState: function() {
         return this._currentMode;
      },
      destroy: function() {
         /*TODO написать в конце, чтобы ни чего не забыть разрушить*/
         OperationsPanel.superclass.destroy.apply(this);
      }
   });
   return OperationsPanel;
});
