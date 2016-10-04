define('js!SBIS3.CONTROLS.FieldLink',
    [
       'js!SBIS3.CONTROLS.SuggestTextBox',
       'js!SBIS3.CONTROLS.ItemsControlMixin',
       'js!SBIS3.CONTROLS.MultiSelectable',
       'js!SBIS3.CONTROLS.ActiveMultiSelectable',
       'js!SBIS3.CONTROLS.Selectable',
       'js!SBIS3.CONTROLS.ActiveSelectable',
       'js!SBIS3.CONTROLS.SyncSelectionMixin',
       'js!SBIS3.CONTROLS.FieldLinkItemsCollection',
       'html!SBIS3.CONTROLS.FieldLink/afterFieldWrapper',
       'html!SBIS3.CONTROLS.FieldLink/beforeFieldWrapper',
       'js!SBIS3.CONTROLS.Utils.DialogOpener',
       'js!SBIS3.CONTROLS.ITextValue',
       'js!SBIS3.CONTROLS.Utils.TemplateUtil',
       'js!WS.Data/Di',
       'js!SBIS3.CONTROLS.MenuIcon',
       'js!SBIS3.CONTROLS.Action.SelectorAction',
       'i18n!SBIS3.CONTROLS.FieldLink'

    ],
    function (
        SuggestTextBox,
        ItemsControlMixin,

        /* Интерфейс для работы с набором выбранных записей */
        MultiSelectable,
        ActiveMultiSelectable,
        /****************************************************/

        /* Интерфейс для работы с выбранной записью */
        Selectable,
        ActiveSelectable,
        /********************************************/

        SyncSelectionMixin,
        FieldLinkItemsCollection,

        /* Служебные шаблоны поля связи */
        afterFieldWrapper,
        beforeFieldWrapper,
        /********************************************/
        DialogOpener,
        ITextValue,
        TemplateUtil,
        Di
    ) {

       'use strict';

       var INPUT_WRAPPER_PADDING = 11;
       var INPUT_MIN_WIDTH = 100;

       /**
        * Поле связи - это базовый контрол веб-фреймворка WS, который предназначен для выбора нескольких значений.
        * Контрол состоит из поля ввода и кнопки-меню для выбора справочника. Допускается конфигурация контрола, при которой будет использована только кнопка-меню.
        * Интерактивные демонстрационные примеры типовых конфигураций поля связи смотрите в описании к классу.
        * <br/>
        * Выбор значения для поля связи можно производить следующими способами:
        * <ol>
        *    <li>
        *       <b>Через справочник.</b>
        *       Справочник - это диалог выбора значений. Диалог строится на основе пользовательского компонента.
        *       Подробнее о правилах создания компонента для справочника поля связи вы можете прочитать в разделе <a href="http://wi.sbis.ru/doc/platform/developmentapl/interfacedev/components/textbox/field-link/dictionary/">Поле связи</a>.
        *       Набор справочников устанавливают с помощью опции {@link dictionaries}, а режим отображения открытого справочника - с помощью опции {@link chooserMode}.
        *    </li>
        *    <li>
        *       <b>Через автодополнение.</b>
        *       Автодополнение - это функционал отображения возможных результатов поиска по введенным символам. По умолчанию для поля связи автодополнение отключено.
        *       Чтобы при печати в поле ввода отображались релевантные для выбора значения, нужно для поля связи установить конфигурацию автодополнения в опциях {@link list}, {@link listFilter} и {@link text}.
        *       Чтобы установить временную задержку перед началом поиска релевантного значения, используют опцию {@link delay}.
        *       Чтобы отображать полный список значений автодополнения при переходе фокуса на контрол, используют опцию {@link autoShow}.
        *       Демонстрацию работы автодополнения с полем связи вы можете найти в блоке интерактивных примеров в описании к классу.
        *    </li>
        *    <li>
        *       <b>Через контекст контрола.</b>
        *       Этот способ основан работе с <a href="https://wi.sbis.ru/doc/platform/developmentapl/interfacedev/core/context/">контекстом</a> контрола. Пример № 3 из описания класса поля связи демонстрирует возможности установки значения через контекст.
        *    </li>
        * </ol>
        * <br/>
        * Возможность выбора одного или нескольких значений устанавливается опцией {@link multiselect}. В режиме единичного выбора значений с помощью опции {@link alwaysShowTextBox} можно разрешить установку комментариев в поле ввода после того, как для поля связи выбрано значение.
        * <br/>
        * Чтобы добавить внутрь поля ввода подсказку, используйте опцию {@link placeholder}.
        * <br/>
        * Для корректного отображения поля связи рекомендуется установить компоненту фиксированную или минимальную ширину с помощью CSS-свойства width.
        *
        * @class SBIS3.CONTROLS.FieldLink
        * @extends SBIS3.CONTROLS.SuggestTextBox
        *
        * @author Герасимов Александр Максимович
        *
        * @mixes SBIS3.CONTROLS.Selectable
        * @mixes SBIS3.CONTROLS.MultiSelectable
        * @mixes SBIS3.CONTROLS.ActiveSelectable
        * @mixes SBIS3.CONTROLS.ActiveMultiSelectable
        * @mixes SBIS3.CONTROLS.ChooserMixin
        * @mixes SBIS3.CONTROLS.FormWidgetMixin
        * @mixes SBIS3.CONTROLS.SyncSelectionMixin
        * @mixes SBIS3.CONTROLS.ItemsControlMixin
        *
        * @demo SBIS3.CONTROLS.Demo.FieldLinkDemo Пример 1. Поле связи в режиме множественного выбора значений. Выбор можно производить как через справочник, так и через автодополнение.
        * @demo SBIS3.CONTROLS.Demo.FieldLinkSingleSelect Пример 2. Поле связи в режиме единичного выбора значений. Выбор можно производить как через справочник, так и через автодополнение.
        * @demo SBIS3.CONTROLS.Demo.FieldLinkSingleSelectContext Пример 3. Поле связи в режиме единичного выбора значения. В этом примере выбор можно производить тремя способами: через справочник, через автодополнение и через два поля ввода.
        * Поля ввода привязаны к поля контекста, по которым устанавливается ключ и отображаемый текст выбранного значения поля связи. Для наглядности, вы можете изменить поле "Название" и "Ключ", чтобы увидеть результат.
        * @demo SBIS3.CONTROLS.Demo.SelectorButtonIcon Пример 4. Поле связи в виде иконки, поле ввода отсутствует. Вызов справочника производится кликом по кнопке с иконкой. Все выбранные значения будут отображаться справа от кнопки.
        * В режиме множественного выбора удаление выбранных значений производится массово кликом по серому крестику.
        * @demo SBIS3.CONTROLS.Demo.SelectorButtonLink Пример 5. Поле связи в виде кнопки-ссылки, поле ввода отсутствует. Вызов справочника производится кликом по ссылке. Все выбранные значения будут отображаться в качестве текста кнопки.
        * В режиме множественного выбора удаление выбранных значений производится массово кликом по серому крестику. Для корректного отображения кнопки-ссылки используется CSS-модификатор "controls-SelectorButton__asLink".
        * @demo SBIS3.CONTROLS.Demo.FieldLinkDemoTemplate Пример 6. В первых примерах используется один справочник для выбора значений. В следующем демонстрационном примеры вы можете посмотреть настройку компонента справочника. Подробнее о создании справочника можно прочитать в разделе документации <a href="http://wi.sbis.ru/doc/platform/developmentapl/interfacedev/components/textbox/field-link/">Поле связи</a>.
        *
        * @cssModifier controls-FieldLink__itemsEdited В поле связи при наведении курсора на выбранные значения применяется подчеркивание текста.
        * @cssModifier controls-FieldLink__itemsBold В поле связи для текста выбранных значений применяется полужирное начертание.
        *
        * @ignoreOptions tooltip alwaysShowExtendedTooltip loadingContainer observableControls pageSize usePicker filter saveFocusOnSelect
        * @ignoreOptions allowEmptySelection allowEmptyMultiSelection templateBinding includedTemplates resultBindings footerTpl emptyHTML groupBy
        * @ignoreMethods getTooltip setTooltip getExtendedTooltip setExtendedTooltip setEmptyHTML setGroupBy itemTpl
        *
        * ignoreEvents onDataLoad onDataLoadError onBeforeDataLoad onDrawItems
        *
        * @control
        * @public
        * @category Inputs
        */

       var FieldLink = SuggestTextBox.extend([MultiSelectable, ActiveMultiSelectable, Selectable, ActiveSelectable, SyncSelectionMixin, ItemsControlMixin, ITextValue],/** @lends SBIS3.CONTROLS.FieldLink.prototype */{
          /**
           * @name SBIS3.CONTROLS.FieldLink#textValue
           * @cfg {String} Хранит строку, сформированную из значений поля отображения выбранных элементов коллекции.
           * @remark
           * Значения в строке перечислены через запятую. Отображаемые значения в строке определяются с помощью опции {@link displayField} или {@link itemTemplate}.
           * Опция доступна только на чтение. Запрещена двусторонняя привязка к полю контекста.
           * @see getTexValue
           * @see displayField
           * @see itemTemplate
           */
          /**
           * @event onItemActivate Происходит при клике по выбранному элементу коллекции.
           * @param {$ws.proto.EventObject} eventObject Дескриптор события.
           * @param {Object} meta Объект, описывающий метаданные события. В его свойствах передаются идентификатор и экземпляр выбранного значения.
           * @param {String} meta.id Идентификатор выбранного значения.
           * @param {SBIS3.CONTROLS.Record} meta.item Экземпляр класса выбранного значения.
           */
          $protected: {
             _inputWrapper: null,     /* Обертка инпута */
             _linksWrapper: null,     /* Контейнер для контрола выбранных элементов */
             _dropAllButton: null,    /* Кнопка очистки всех выбранных записей */
             _showAllLink: null,      /* Кнопка показа всех записей в пикере */
             _linkCollection: null,   /* Контрол отображающий выбранные элементы */
             _selectorAction: null,   /* Action выбора */
             _checkWidth: true,
             _lastFieldLinkWidth: null,
             _afterFieldWrapper: null,
             _beforeFieldWrapper: null,
             _options: {
                /* Служебные шаблоны поля связи (иконка открытия справочника, контейнер для выбранных записей */
                afterFieldWrapper: afterFieldWrapper,
                beforeFieldWrapper: beforeFieldWrapper,
                /**********************************************************************************************/
                 list: {
                   component: 'js!SBIS3.CONTROLS.DataGridView',
                   options: {
                      showHead: false,
                      columns: []
                   }
                },
                /**
                 * @typedef {String} selectionTypeDef Режим выбора.
                 * @variant node выбираются только узлы
                 * @variant leaf выбираются только листья
                 * @variant all выбираются все записи
                 *
                 * @typedef {Object} Dictionaries
                 * @property {String} name Имя (Идентификатор справочника).
                 * @property {selectionTypeDef} selectionType
                 * @property {String} caption Текст в меню выбора справочников. Опция актуальна, когда для поля связи установлено несколько справочников.
                 * Открыть справочник можно через меню выбора справочников или с помощью метода {@link showSelector}.
                 * Меню выбора справочников - это кнопка, которая расположена внутри поля связи с правого края:
                 * ![](/FieldLink03.png)
                 * Изменять положение этой кнопки нельзя. Когда для поля связи установлен только один справочник, клик по кнопке меню производит его открытие.
                 * Когда для поля связи установлено несколько справочников, клик по меню открывает подменю для выбора нужного справочника.
                 * Опция caption определяет название справочника в этом подменю:
                 * ![](/FieldLink02.png)
                 * @property {String} template Компонент, на основе которого организован справочник.
                 * Список значений справочника строится на основе любого компонента, который можно использовать для {@link https://wi.sbis.ru/doc/platform/developmentapl/interfacedev/components/list/ отображения данных в списках}:
                 * - использование компонента {@link SBIS3.CONTROLS.DataGridView}:
                 * ![](/FieldLink00.png)
                 * - использование компонента {@link SBIS3.CONTROLS.TreeDataGridView}:
                 * ![](/FieldLink01.png)
                 * Подробнее о правилах создания компонента для справочника поля связи вы можете прочитать в разделе <a href="http://wi.sbis.ru/doc/platform/developmentapl/interfacedev/components/textbox/field-link/">Поле связи</a>.
                 * @property {Object} componentOptions
                 * Группа опций, которые передаются в секцию _options компонента из опции template. На его основе строится справочник.
                 * Значения переданных опций можно использовать в дочерних компонентах справочника через инструкции шаблонизатора.
                 * Например, передаём опции для построения справочника:
                 * <pre class="brush: xml">
                 *     <option name="template">js!SBIS3.MyArea.MyDatGridView</option>
                 *     <options name="componentOptions">
                 *        <option name="myShowHeadConfig" type="boolean">true</option>
                 *        <option name="myPageSizeConfig" type="number">5</option>
                 *     </options>
                 * </pre>
                 * При построении справочника на основе компонента SBIS3.MyArea.MyComponent значения опций myShowHeadConfig и myPageSizeConfig будут переданы в его секцию _options.
                 * Они переопределят уже установленные значения опций, если такие есть.
                 * Чтобы использовать значений опций в дочерних контролах компонента SBIS3.MyArea.MyDatGridView, нужно использовать инструкции шаблонизатора в вёрстке компонента:
                 * <pre class="brush: xml">
                 *     <component data-component="SBIS3.CONTROLS.TreeCompositeView" name="browserView">
                 *        <option name="showHead">{{=it.myShowHeadConfig}}</option>
                 *        <option name="pageSize">{{=it.myPageSizeConfig}}</option>
                 *         . . .
                 *     </component>
                 * </pre>
                 * @translatable caption
                 */
                /**
                 * @cfg {Array.<Dictionaries>} Устанавливает справочники для поля связи.
                 * @remark file FieldLink-dictionaries.md
                 * @example
                 * Настройка двух справочников для выбора в поле связи:
                 * ![](/FieldLink02.png)
                 * Фрагмент верстки:
                 * <pre class="brush: xml">
                 *     <options name="dictionaries" type="array">
                 *        <options>
                 *           <option name="caption">Сотрудники</option>
                 *           <option name="template">js!SBIS3.MyArea.DictEmployees</option>
                 *        </options>
                 *        <options>
                 *           <option name="caption">Партнеры</option>
                 *           <option name="template">js!SBIS3.MyArea.DictPartners</option>
                 *        </options>
                 *     </options>
                 * </pre>
                 * @see setDictionaries
                 * @see chooserMode
                 */
                dictionaries: [],
                /**
                 * @cfg {Boolean} Устанавливает режим добавления комментариев в поле связи.
                 * * true Разрешается ввод комментариев в поле связи.
                 * * false Запрещается ввод комментариев в поле связи.
                 * @remark
                 * Опция позволяет установить режим работы поля связи, в котором после выбора значения допускается добавление комментариев внутри поля ввода.
                 * Добавление комментариев поддерживается только, когда поле связи установлено в режим единичного выбора значений.
                 * Режим единичного или множественого выбора значений в поле связи устанавливается опцией {@link multiselect}.
                 * До момента ввода комментария справа от выбранного значения в поле связи будет отображаться текст, настраиваемый в опции {@link placeholder}.
                 * @example
                 * Пример настройки режима добавления комментария в поле связи:
                 * фрагмент верстки:
                 * <pre class="brush: xml">
                 *     <option name="alwaysShowTextBox">true</option>
                 * </pre>
                 * иллюстрация работы:
                 * ![](/FieldLink04.png)
                 * @deprecated
                 */
                alwaysShowTextBox: false,
                /**
                 * @cfg {String} Устанавливает шаблон, по которому будет построено отображение каждого выбранного значения в поле связи.
                 * @remark
                 * Шаблон - это вёрстка, по которой будет построено отображение каждого выбранного значения в поле связи.
                 * Внутри шаблона допускается использование {@link https://wi.sbis.ru/doc/platform/developmentapl/interfacedev/core/component/xhtml/template конструкций шаблонизатора}.
                 * Шаблон может быть реализован отдельным XHTML-файлом.
                 * В этом случае чтобы передать его содержимое в опцию, он должен быть подключен в массив зависимостей компонента (см. примеры).
                 * @example
                 * Пример. Шаблон создан в отдельном XHTML-файле. Сначала его нужно подключить в массив зависимостей компонента, затем в опции указать путь до шаблона.
                 * <pre class="brush: xml">
                 *     <option name="itemTemplate" type="string">html!SBIS3.MyArea.MyComponent/resources/myTemplate</option>
                 * </pre>
                 */
                itemTemplate: null,
                /**
                 * @cfg {Boolean} Использовать для выбора {@link SBIS3.CONTROLS.Action.SelectorAction}
                 */
                useSelectorAction: false
             }
          },

          $constructor: function() {
             var commandDispatcher = $ws.single.CommandDispatcher,
                 self = this;

             this._publish('onItemActivate');

             /* Проиницализируем переменные */
             this._setVariables();

             commandDispatcher.declareCommand(this, 'clearAllItems', this._dropAllItems);
             commandDispatcher.declareCommand(this, 'showAllItems', this._showAllItems);

            /* При изменении выбранных элементов в поле связи - сотрём текст.
               Достаточно отслеживать изменение массива ключей,
               т.к. это событие гарантирует изменение выбранных элементов
               Это всё актуально для поля связи без включенной опции alwaysShowTextBox,
               если она включена, то логика стирания текста обрабатывается по-другому. */
            this.subscribe('onSelectedItemsChange', function(event, result, changed) {
               if(self.getText() && !self._options.alwaysShowTextBox) {
                  self.setText('');
               }
               /* При добавлении элементов надо запустить валидацию,
                  если же элементы были удалены,
                  то валидация будет запущена либо эрией, либо по уходу фокуса из поля связи (По стандарту). */
               if(changed.added.length && !self._isEmptySelection()) {
                  /* Надо дожидаться загрузки выбранных записей,
                     т.к. часто валидируют именно по ним,
                     или же по значениям в контексте */
                  self.getSelectedItems(true).addCallback(function(list) {
                     self.validate();
                     return list
                  })
               }
            });

            if(this._options.oldViews) {
               $ws.single.ioc.resolve('ILogger').log('FieldLink', 'В 3.8.0 будет удалена опция oldViews, а так же поддержка старых представлений данных на диалогах выбора.');
            }
          },

          init: function() {
             FieldLink.superclass.init.apply(this, arguments);

             if(this._options.useSelectorAction) {
                this.subscribeTo((this._selectorAction = this.getChildControlByName('FieldLinkSelectorAction')), 'onExecuted', function(event, meta, result) {
                   if(result) {
                      this.setSelectedItems(result);
                   }
                }.bind(this));
             }

             this.getChildControlByName('fieldLinkMenu').setItems(this._options.dictionaries);
          },

           _getShowAllConfig: function(){
               /* Если не передали конфигурацию диалога всех записей для автодополнения,
                то по-умолчанию возьмём конфигурацию первого словаря */
               if(Object.isEmpty(this._options.showAllConfig)) {
                   return this._options.dictionaries[0];
               }
               return this._options.showAllConfig;
           },

          /**
           * Обработчик нажатия на меню(элементы меню), открывает диалог выбора с соответствующим шаблоном
           * @private
           */
          _menuItemActivatedHandler: function(e, item) {
             var rec = this.getItems().getRecordById(item);
             this.getParent().showSelector(rec.get('template'), rec.get('componentOptions'), rec.get('selectionType'));
          },

          /**
           * Устанавливает набор справочников для поля связи. Подробнее о справочниках вы можете прочитать в описании к опции {@link dictionaries}.
           * @param {Array.<Dictionaries>} dictionaries Конфигурация справочников поля связи.
           * @example
           * Установим для поля связи два справочника:
           * <pre>
           *     myFieldLink.setDictionaries(
           *        [
           *           {
           *              caption: 'Сотрудники',
           *              template: 'js!SBIS3.MyArea.DictEmployees' // Компонент, на основе которого будет построен справочник поля связи
           *              componentOptions: {
           *                 myShowHeadConfig: true,
           *                 myPageSizeConfig: 5
           *              }
           *           },
           *           {
           *              caption: 'Сотрудники',
           *              template: 'js!SBIS3.MyArea.DictEmployees' // Компонент, на основе которого будет построен справочник поля связи
           *           }
           *        ]
           *     );
           * </pre>
           * @see dictionaries
           */
          setDictionaries: function(dictionaries) {
             this._options.dictionaries = dictionaries;
             this.getChildControlByName('fieldLinkMenu').setItems(dictionaries);
             this._notifyOnPropertyChanged('dictionaries');
          },


          /**
           * Для поля связи требуется своя реализация метода setSelectedKey, т.к.
           * Selectable расчитывает на наличие проекции и items, которых в поле связи нет.
           * + полю связи не требуется единичная отрисовка item'a, т.к. при синхронизации selectedKey и selectedKeys,
           * всегда будет вызываться метод drawSelectedItems
           * @param key
           */
          setSelectedKey: function(key) {
             this._options.selectedKey = key;
             this._notifySelectedItem(this._options.selectedKey);
          },

          /**
           * Открывает справочник для поля связи.
           * @remark
           * Метод  используется для открытия справочника из JS-кода компонента.
           * Подробно о настройке и работе со справочниками можно прочесть в описании к опции {@link dictionaries}.
           * @example
           * @param {String} template Компонент, который будет использован для построения справочника.
           * @param {Object} componentOptions Опции, которые будут использованы в компоненте при построении справочника.
           * Подробное описание можно прочесть {@link SBIS3.CONTROLS.FieldLink/dictionaries.typedef здесь}.
           * @example
           * <pre>
           *     this.showSelector(
           *        'js!SBIS3.MyArea.MyDictionary',
           *        {
           *           title: 'Сотрудники предприятия'
           *        }
           *     );
           * </pre>
           * @see dictionaries
           * @see setDictionaries
           */
          showSelector: function(template, componentOptions, selectionType) {
             if(this.isPickerVisible()) {
                this.hidePicker();
             }

             if(this._options.useSelectorAction) {
                this._selectorAction.execute({
                   template: template,
                   componentOptions: componentOptions,
                   multiselect: this.getMultiselect(),
                   selectionType: selectionType,
                   selectedItems: this.getSelectedItems()
                });
             } else {
                this._showChooser(template, componentOptions);
             }
          },

          setActive: function(active) {
             FieldLink.superclass.setActive.apply(this, arguments);

             if (active && this._needFocusOnActivated() && this.isEnabled() && $ws._const.browser.isMobilePlatform) {
                this._getElementToFocus().focus();
             }
          },

          _getAdditionalChooserConfig: function () {
             var oldRecArray = [],
                selectedKeys = this._isEmptySelection() ? [] : this.getSelectedKeys(),
                selectedItems, oldRec;

             if(this._options.oldViews) {
                selectedItems = this.getSelectedItems();

                if(selectedItems) {
                   selectedItems.each(function(rec) {
                      oldRec = DialogOpener.convertRecord(rec);
                      if(oldRec) {
                         oldRecArray.push(oldRec);
                      }
                   });
                }
             }

             return {
                currentValue: selectedKeys,
                currentSelectedKeys: selectedKeys,
                selectorFieldLink: true,
                multiSelect: this._options.multiselect,
                selectedRecords: oldRecArray
             };
          },

          _modifyOptions: function() {
             var cfg = FieldLink.superclass._modifyOptions.apply(this, arguments);

             /* className вешаем через modifyOptions,
                так меньше работы с DOM'ом */
             cfg.className += ' controls-FieldLink';
             cfg.itemTemplate = TemplateUtil.prepareTemplate(cfg.itemTemplate);
             return cfg;
          },

          _getLinkCollection: function() {
             if(!this._linkCollection) {
                return (this._linkCollection = this.getChildControlByName('FieldLinkItemsCollection'));
             }
             return this._linkCollection;
          },

          /** Обработчики событий контрола отрисовки элементов **/
          _onDrawItemsCollection: function() {
             this._updateInputWidth();
          },
          _onCrossClickItemsCollection: function(key) {
             this.removeItemsSelection([key]);
             if(!this._options.multiselect && this._options.alwaysShowTextBox) {
                this.setText('');
             }
          },
          _onItemActivateItemsCollection: function(key) {
             this.getSelectedItems(false).each(function(item) {
                if(item.getId() == key) {
                   this._notify('onItemActivate', {item: item, id: key});
                }
             }, this)
          },
          _onClosePickerItemsCollection: function() {
             this._pickerStateChangeHandler(false);
          },
          _onShowPickerItemsCollection: function() {
             this._pickerStateChangeHandler(true);
          },
          /**************************************************************/

          _observableControlFocusHandler: function() {
             /* Не надо обрабатывать приход фокуса, если у нас есть выбрынные
              элементы при единичном выборе, в противном случае, автодополнение будет посылать лишний запрос,
              хотя ему отображаться не надо. */
             if(!this._needShowSuggest()) {
                return false;
             }
             FieldLink.superclass._observableControlFocusHandler.apply(this, arguments);
          },

          _needShowSuggest: function() {
             return !(!this._isEmptySelection() && !this._options.multiselect);
          },

          /**
           * Обрабатывает результат выбора из справочника
           * @param {Array} result
           * @private
           */
          _chooseCallback: function(result) {
             var isModel;

             if(result && result.length) {
                isModel = $ws.helpers.instanceOfModule(result[0], 'WS.Data/Entity/Model');
                this.setText('');

                if(isModel) {
                   this.addSelectedItems(result);
                } else {
                   this.addItemsSelection(result);
                }
             }
          },

          /**
           * Возвращает выбранные элементы в виде текста.
           * @deprecated Метод getCaption устарел, используйте getTextValue
           * @returns {string}
           */
          getCaption: function() {
             $ws.single.ioc.resolve('ILogger').log('FieldLink::getCaption', 'Метод getCaption устарел, используйте getTextValue');
             return this.getTextValue();
          },

           /**
            * Возвращает строку, сформированную из текстовых значений полей выбранных элементов коллекции.
            * @remark
            * Метод формирует строку из значений полей выбранных элементов коллекции. Значения в строке будут перечислены через запятую.
            * Отображаемые значения определяются с помощью опции {@link displayField} или {@link itemTemplate}.
            * @returns {string} Строка, сформированная из отображаемых значений в поле связи.
            * @see texValue
            * @see displayField
            * @see itemTemplate
            */
          getTextValue: function() {
              var displayFields = [],
                  selectedItems = this.getSelectedItems(),
                  self = this;

              if(selectedItems) {
                 selectedItems.each(function(rec) {
                    displayFields.push($ws.helpers.htmlToText(rec.get(self._options.displayField) || ''));
                 });
              }

              return displayFields.join(', ');
          },

          /**
           * Устанавливает переменные, для дальнейшей работы с ними
           * @private
           */
          _setVariables: function() {
             this._linksWrapper = this._container.find('.controls-FieldLink__linksWrapper');
             this._inputWrapper = this._container.find('.controls-TextBox__fieldWrapper');

             this._afterFieldWrapper = this._container.find('.controls-TextBox__afterFieldWrapper');
             this._beforeFieldWrapper = this._container.find('.controls-TextBox__beforeFieldWrapper');

             if(this._options.multiselect) {
                this._dropAllLink = this._container.find('.controls-FieldLink__dropAllLinks');
                this._showAllLink = this._container.find('.controls-FieldLink__showAllLinks');
             }
          },

          _onResizeHandler: function() {
             var linkCollection = this._getLinkCollection();

             FieldLink.superclass._onResizeHandler.apply(this, arguments);

             if(!linkCollection.isPickerVisible() && this._needRedrawOnResize()) {
                /* Почему надо звать redraw: поле связи может быть скрыто, когда в него проставили выбранные записи,
                   и просто пересчётом input'a тут не обойтись. Выполняться должно быстро, т.к. перерисовывается обычно всего 2-3 записи */
                linkCollection.redraw();
             }
          },

          _needRedrawOnResize: function () {
             var width = this._container[0].offsetWidth;

             /* В целях оптимизации запоминаем ширину, чтобы перерисовка вызывалась только если изменилась ширина поля связи */
             if(this._lastFieldLinkWidth !== width) {
                this._lastFieldLinkWidth = width;
                return true;
             }
             return false;
          },

          /**
           * Показывает все элементы поля связи в выпадающем списке
           * @private
           */
          _showAllItems: function() {
             if(this.isPickerVisible()) {
                this.hidePicker();
             }
             this._getLinkCollection().togglePicker();
          },

          /**
           * Удаляет все элементы поля связи,
           * ставит курсор в поле ввода
           * @private
           */
          _dropAllItems: function() {
             this.removeItemsSelectionAll();
             this._inputField.focus();
             this._observableControlFocusHandler();
          },

          /**
           * Обрабатывает скрытие/открытие пикера
           * @param open
           * @private
           */
          _pickerStateChangeHandler: function(open) {
             this._dropAllLink.toggleClass('ws-hidden', !open);
             this._inputWrapper.toggleClass('ws-invisible', open);
          },

          /**
           * Обработчик на выбор записи в автодополнении
           * @private
           */
          _onListItemSelect: function(id, item) {
             /* Чтобы не было лишнего запроса на БЛ, добавим рекорд в набор выбранных */
             this.addSelectedItems(item instanceof Array ? item : [item]);
             this.setText('');
             /* При выборе скрываем саггест, если он попадает под условия,
                когда его не надо показывать см. _needShowSuggest */
             if(!this._needShowSuggest()) {
                this.hidePicker();
             /* При выборе фокус могу перевести, надо проверить это */
             } else if(this.isActive()) {
                this._observableControlFocusHandler();
             }
          },


          setDataSource: function(ds, noLoad) {
             this.once('onListReady', function(event, list) {
                if(!list.getDataSource()) {
                   list.setDataSource(ds, noLoad);
                }
             });
             FieldLink.superclass.setDataSource.apply(this, arguments);
          },

          _loadAndDrawItems: function(amount) {
             var linkCollection = this._getLinkCollection(),
                 linkCollectionContainer = linkCollection.getContainer(),
                 self = this;

             /* Нужно скрыть контрол отображающий элементы, перед загрузкой, потому что часто бл может отвечать >500мс и
              отображаемое значение в поле связи долго не меняется, особенно заметно в редактировании по месту. */
             linkCollectionContainer.addClass('ws-hidden');
             this.getSelectedItems(true, amount).addCallback(function(list){
                self._dataLoadedCallback();
                linkCollectionContainer.removeClass('ws-hidden');
                linkCollection.setItems(list);
                return list;
             });
          },

          _dataLoadedCallback: function() {
             /* Т.к. операция загрузки записей асинхронная, то за это время поле связи может скрыться,
                надо на это проверить */
             if(!this.isVisibleWithParents()) {
                this._lastFieldLinkWidth = 0;
             }
             FieldLink.superclass._dataLoadedCallback.apply(this, arguments);
          },

          _drawSelectedItems: function(keysArr) {
             var keysArrLen = this._isEmptySelection() ? 0 : keysArr.length;

             /* Если удалили в пикере все записи, и он был открыт, то скроем его */
             if (!keysArrLen) {
                this._toggleShowAllLink(false);
             }

             if(!this._options.alwaysShowTextBox) {

                if(!this._options.multiselect) {
                   this._inputWrapper.toggleClass('ws-hidden', Boolean(keysArrLen));
                }
             }

             this._loadAndDrawItems(keysArrLen, this._options.pageSize);
          },

          _prepareItems: function() {
             var items = FieldLink.superclass._prepareItems.apply(this, arguments),
                 self = this,
                 newRec, dataSource, dataSourceModel, dataSourceModelInstance;

             if(items) {
                dataSource = this.getDataSource();

                if(dataSource) {
                   dataSourceModel = dataSource.getModel();
                   /* Создадим инстанс модели, который указан в dataSource,
                    чтобы по нему проверять модели которые выбраны в поле связи */
                   dataSourceModelInstance = typeof dataSourceModel === 'string' ? Di.resolve(dataSourceModel) : new dataSourceModel();

                   items.each(function(rec, index) {
                      /* Если модель сорса и выбранной записи разные, то создадим копию модели сорса,
                       и заполним её данными из выбранной записи */
                      if( dataSourceModelInstance._moduleName !==  rec._moduleName) {
                         (newRec = dataSourceModelInstance.clone()).merge(rec);
                         rec = newRec;
                         items.replace(rec, index);
                      }
                   });
                }

                /* Элементы, установленные из дилогов выбора / автодополнения могут иметь другой первичный ключ,
                   отличный от поля с ключём, установленного в поле связи. Это связно с тем, что "связь" устанавливается по опеределённому полю,
                   и не обязательному по первичному ключу у записей в списке. */
                items.each(function(rec) {
                   if(rec.getIdProperty() !== self._options.keyField && rec.get(self._options.keyField) !== undefined) {
                      rec.setIdProperty(self._options.keyField);
                   }
                })
             }
             return items;
          },

          setListFilter: function() {
             /* Если единичный выбор в поле связи, но textBox всё равно показывается(включена опция), запрещаем работу suggest'a */
             if(!this._options.multiselect &&
                 !this._isEmptySelection() &&
                 this._options.alwaysShowTextBox) {
                return;
             }
             FieldLink.superclass.setListFilter.apply(this, arguments);
          },

          showPicker: function() {
             /* Если открыт пикер, который показывает все выбранные записи, то не показываем автодополнение */
             if(this._getLinkCollection().isPickerVisible()) {
                return;
             }
             FieldLink.superclass.showPicker.apply(this, arguments);
          },
          /**
           * Проверяет, нужно ли отрисовывать элемент или надо показать троеточие
           */
          _checkItemBeforeDraw: function(item) {
             var needDrawItem = false,
                 linkCollection = this._getLinkCollection(),
                 inputMinWidth = INPUT_WRAPPER_PADDING,
                 inputWidth, newItemWidth;

             /* Для ситуаций, когда поле ввода не скрывается после выбора - минимальная ширина 100px (по стандарту),
                однако в задизейбленом состоянии это учитывать не надо, т.к. поле ввода визуально не отображается */
             if((this._options.multiselect || this._options.alwaysShowTextBox) && this.isEnabled()) {
                inputMinWidth += INPUT_MIN_WIDTH;
             }

             /* Если элементы рисуются в пикере то ничего считать не надо */
             if(linkCollection.isPickerVisible()) {
                return true;
             }

             /* Тут считается ширина добавляемого элемента, и если он не влезает,
              то отрисовываться он не будет и покажется троеточие, однако хотя бы один элемент в поле связи должен поместиться */
             if(this._checkWidth) {
                inputWidth = this._getInputWidth();
                newItemWidth = $ws.helpers.getTextWidth(item[0].outerHTML);
                /* Считаем, нужно ли отрисовывать элемент по следующему правилу:
                   Ширина добавляемого элемента + минимальная ширина поля ввода (для мултивыбора) не должны быть больше ширины контейнера контрола */
                needDrawItem = (newItemWidth + inputMinWidth) < (inputWidth + INPUT_WRAPPER_PADDING);

                if(!needDrawItem && inputWidth) {
                   /* Если в поле связи не отрисовано ни одного элемента, то уменьшаем ширину добавляемого,
                      т.к. хотя бы один элемент должен быть отрисован (стандарт) */
                   if(!linkCollection.getContainer().find('.controls-FieldLink__linkItem').length) {
                      item.addClass('ws-ellipsis');
                      item[0].style.width = inputWidth - inputMinWidth + 'px';
                      needDrawItem = true;
                   }
                   this._checkWidth = false;
                }
             }
             this._toggleShowAllLink(!needDrawItem);
             return needDrawItem
          },

          setEnabled: function() {
             FieldLink.superclass.setEnabled.apply(this, arguments);
             /* При изменении состояния поля связи, надо скинуть старую запомненую ширину,
                если это произошло в скрытом состоянии, иначе поле показа не запустится перерисовка */
             if(!this.isVisibleWithParents()) {
                this._lastFieldLinkWidth = null;
             }
          },

          /**
           * Конфигурация пикера
           */
          _setPickerConfig: function () {
             var cfg = {
                corner: 'bl',
                target: this._container,
                opener: this,
                parent: this,
                closeByExternalClick: true,
                targetPart: true,
                className: 'controls-FieldLink__picker',
                verticalAlign: {
                   side: 'top'
                },
                horizontalAlign: {
                   side: 'left'
                },
                handlers: {
                   onShow: function() {
                      var revertedVertical = this._picker.getContainer().hasClass('controls-popup-revert-vertical');

                      if($ws._const.browser.isMobileIOS) {
                         revertedVertical = !revertedVertical;
                      }

                      if (revertedVertical) {
                         if (!this._listReversed) {
                            this._reverseList();
                         }
                      } else {
                         if (this._listReversed) {
                            this._reverseList();
                         }
                      }
                   }.bind(this)
                }
             };
             // Придрот для айпада. Выезжающая клавиатура может скрывать выпадашку, так как та влезает под нее. Поэтому на айпаде всегда открываем автодополнение вверх
             if ($ws._const.browser.isMobileIOS){
                cfg.corner = 'tl';
                cfg.verticalAlign.side = 'bottom';
             }
             return cfg;
          },
          /**
           * Обрабатывает нажатие клавиш, специфичных для поля связи
           */
          _keyUpBind: function(e) {
             FieldLink.superclass._keyUpBind.apply(this, arguments);
             switch (e.which) {
                /* ESC закрывает все пикеры у поля связи(если они открыты) */
                case $ws._const.key.esc:
                   var linkCollection =  this._getLinkCollection();

                   if(this.isPickerVisible() || linkCollection.isPickerVisible()) {
                      this.hidePicker();
                      linkCollection.hidePicker();
                      e.stopPropagation();
                   }
                   break;
             }
          },

          _keyDownBind: function(e) {
             FieldLink.superclass._keyDownBind.apply(this, arguments);
             switch (e.which) {
                case $ws._const.key.del:
                   if(!this.getText()) {
                      this.removeItemsSelectionAll();
                   }
                   break;
                /* Нажатие на backspace должно удалять последние значение, если нет набранного текста */
                case $ws._const.key.backspace:
                   if(!this.getText() && !this._isEmptySelection()) {
                      var selectedKeys = this.getSelectedKeys();
                      this.removeItemsSelection([selectedKeys[selectedKeys.length - 1]]);
                   }
                   break;
             }
          },

          /**
           * Скрывает/показывает кнопку показа всех записей
           */
          _toggleShowAllLink: function(show) {
             this._options.multiselect && this._showAllLink && this._showAllLink.toggleClass('ws-hidden', !show);
          },

          /**
           * Рассчитывает ширину поля ввода, учитывая всевозможные wrapper'ы и отступы
           * @returns {number}
           * @private
           */
          _getInputWidth: function() {
             var width = this._container[0].clientWidth  -
                 (this._afterFieldWrapper[0].offsetWidth +
                 this._beforeFieldWrapper[0].offsetWidth +
                 INPUT_WRAPPER_PADDING);

             /* Когда поле связи скрыто, могут происходить неправильные расчёты, самый дешёвый способ этого избежать,
                просто считать что ширина  - 0 */
             return (width >= 0) ? width : 0;
          },
          /**
           * Обновляет ширину поля ввода
           */
          _updateInputWidth: function() {
             var inputWidth;
             this._checkWidth = true;

             /* Для поля связи в задизейбленом состоянии считаем, ширина инпута - 0, т.к. он визуально не отображается */
             if(this.isEnabled()) {
                inputWidth = this._getInputWidth();

                /* По неустановленным причинам, после обновления хрома, он для некоторых элементов начинает возвращать нулевую ширину,
                   после чистки кэша или перезагрузки браузера проблема исчезает, но надо от этого защититься (повторялось только в хроме) */
                if(!inputWidth && this._isEmptySelection()) {
                   inputWidth = 'auto';
                }
             } else  {
                inputWidth = 0;
             }
             this._inputField[0].style.width = (inputWidth === 'auto' ? inputWidth : inputWidth + 'px');
          },

          /* Заглушка, само поле связи не занимается отрисовкой */
          redraw: $ws.helpers.nop,
          /* Заглушка, само поле связи не занимается загрузкой списка */
          reload: $ws.helpers.nop,


          destroy: function() {
             this._linksWrapper = undefined;
             this._inputWrapper = undefined;
             this._afterFieldWrapper = undefined;
             this._beforeFieldWrapper = undefined;

             if(this._linkCollection) {
                this._linkCollection.destroy();
                this._linkCollection = undefined;
             }

             if(this._options.multiselect) {
                this._showAllLink.unbind('click');
                this._showAllLink = undefined;

                this._dropAllLink.unbind('click');
                this._dropAllLink = undefined;
             }
             FieldLink.superclass.destroy.apply(this, arguments);
          }
       });

       return FieldLink;

    });