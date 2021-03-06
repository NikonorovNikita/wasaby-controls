import {IContextMenuConfig} from './IContextMenuConfig';
import {IItemAction, TActionCaptionPosition, TItemActionsPosition, TItemActionVisibilityCallback} from './IItemAction';
import {TActionAlignment} from './IItemActionsTemplateConfig';

/**
 * @typedef {String} TItemActionsVisibility
 * @variant onhover Операции над записью отображаются при наведении на запись;
 * @variant visible Операции над записью отображены изначально.
 * @variant delayed Операции над записью отображаются при наведении на запись и удержании над ней курсора мыши в течение 500 мс.
 */
/*
 * @typedef {String} TItemActionsVisibility
 * @variant onhover ItemActions will be Initialized and displayed right after mouseenter over Item
 * @variant visible ItemActions will be Initialized and displayed on control mount
 * @variant delayed ItemActions will be Initialized and displayed after mouseenter with 500ms delay over Item
 */
type TItemActionsVisibility = 'onhover'|'delayed'|'visible';

/**
 * Интерфейс опций контрола, который работает с {@link Controls/_itemActions/Controller контроллером опций записи}
 * @interface Controls/_itemActions/interface/IItemActionsOptions
 * @public
 * @author Аверкиев П.А.
 */

/*
 * Interface of options of Control that works with {@link Controls/_itemActions/Controller Actions controller}
 * @interface Controls/_itemActions/interface/IItemActionsOptions
 * @public
 * @author Аверкиев П.А.
 */

export interface IItemActionsOptions {
    /**
     * @name Controls/_itemActions/interface/IItemActionsOptions#contextMenuVisibility
     * @cfg {Boolean} Определяет доступность контекстного меню строки при нажатии на правую кнопку мыши.
     * @remark
     * См. <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FItemActionsPG">демо-пример</a>
     * @default true
     */

    /*ENG
     * @name Controls/_itemActions/interface/IItemActionsOptions#contextMenuVisibility
     * @cfg {Boolean} Determines whether context menu should be shown on right-click.
     * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FItemActionsPG">Example</a>.
     * @default true
     */
    contextMenuVisibility?: boolean;

    /**
     * @name Controls/_itemActions/interface/IItemActionsOptions#contextMenuConfig
     * @cfg {Controls/menu:IMenuControlOptions} Конфигурация для меню опции записи.
     * @remark
     * Набор опций передается объектом. Заданный объект мержится с минимальным объектом опций, отдаваемых в меню по-умолчанию.
     * В качестве ключей можно использовать следующие свойства:
     * * items — для смены набора элементов.
     * * groupProperty, groupTemplate для установки группировки.
     * * itemTemplate — шаблон элемента меню.
     * * footerTemplate — шаблон футера.
     * * headerTemplate — шаблон шапки.
     * * iconSize — размер иконок в выпадающем меню.
     */

    /*ENG
     * @name Controls/_itemActions/interface/IItemActionsOptions#contextMenuConfig
     * @cfg {Object} Determines whether context menu should be shown on right-click.
     * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FItemActionsPG">Example</a>.
     * @default true
     */
    contextMenuConfig?: IContextMenuConfig;

    /**
     * @name Controls/_itemActions/interface/IItemActionsOptions#itemActions
     * @cfg {Array.<Controls/itemActions:IItemAction>} Конфигурация опций записи.
     * @remark
     * Для корректной работы опций записи для контрола нужно задать значение в опции {@link Controls/list:View#keyProperty keyProperty}.
     * Подробнее о работе с опциями записи читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/item-actions/ здесь}.
     * @demo Controls-demo/list_new/ItemActions/ItemActionsPosition/Inside/Index
     * @see itemActionsPosition
     * @see itemActionVisibilityCallback
     * @see itemActionsProperty
     * @see actionClick
     * @see actionAlignment
     * @see actionCaptionPosition
     */

    /*ENG
     * @name Controls/_itemActions/interface/IItemActionsOptions#itemActions
     * @cfg {Array.<Controls/itemActions:IItemAction>} Array of configuration objects for buttons which will be shown when the user hovers over an item.
     * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FItemActionsPG">Example</a>.
     */
    itemActions?: IItemAction[];

    /**
     * @name Controls/_itemActions/interface/IItemActionsOptions#itemActionsPosition
     * @cfg {Controls/_itemActions/interface/IItemAction/TItemActionsPosition.typedef} Позиционирование панели с {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/item-actions/position/ опциями записи}.
     * @remark
     * См. <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FItemActionsPG">демо-пример</a>.
     * См. <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FItemActionsCustom">демо-пример</a>.
     * Подробнее о работе с опциями записи читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/item-actions/ здесь}.
     * Пример использования значения custom можно посмотреть в {@link /doc/platform/developmentapl/interface-development/controls/list/list/item-template/config/#item-actions-position статье}.
     * @example
     * Размещаем опции записи в шаблоне с использованием itemActionsTemplate:
     * <pre class="brush: html; highlight: [5]">
     * <Controls.list:View itemActionsPosition="custom" itemActions="{{_itemActions}}">
     *    <ws:itemTemplate>
     *      <ws:partial template="Controls/list:ItemTemplate">
     *        <ws:contentTemplate>
     *          <ws:partial template="wml!customTemplateName" scope="{{contentTemplate}}" />
     *        </ws:contentTemplate>
     *      </ws:partial>
     *    </ws:itemTemplate>
     * </Controls.list:View>
     * </pre>
     *
     * <pre class="brush: html; highlight: [4, 5, 6, 7]">
     * <!-- customTemplateName.wml -->
     * <div>{{itemData.item.title}}</div>
     *    <ws:if data="{{!itemData.isSwiped()}}">
     *       <ws:partial template="{{itemActionsTemplate}}"
     *                  attr:class="some-custom-class-for-itemActions"
     *                  itemData="{{itemData}}"
     *                  scope="{{_options}}"/>
     *    </ws:if>
     * <div>{{itemData.item.description}}</div>
     * </pre>
     * @see itemActions
     * @see itemActionVisibilityCallback
     * @see itemActionsProperty
     * @see actionClick
     * @see actionAlignment
     * @see actionCaptionPosition
     */

    /*ENG
     * @name Controls/_itemActions/interface/IItemActionsOptions#itemActionsPosition
     * @cfg {Controls/_itemActions/interface/IItemAction/TItemActionsPosition.typedef} Position of item actions.
     * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FItemActionsPG">Example</a>.
     * @variant inside Item actions will be positioned inside the item's row.
     * @variant outside Item actions will be positioned under the item's row.
     * @variant custom Item actions must be positioned in the itemTemplate.
     * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FItemActionsCustom">Example</a>.
     * @example
     * Placing Item Actions in custom item template using itemActionsTemplate
     *<pre>
     * <Controls.list:View
     *    itemActionsPosition="custom"
     *    itemActions="{{_itemActions}}">
     *    <ws:itemTemplate>
     *      <ws:partial template="Controls/list:ItemTemplate">
     *        <ws:contentTemplate>
     *          <ws:partial template="wml!customTemplateName" scope="{{contentTemplate}}" />
     *        </ws:contentTemplate>
     *      </ws:partial>
     *    </ws:itemTemplate>
     * </Controls.list:View>
     *</pre>
     *
     * customTemplateName.wml:
     * <pre>
     *  <div>{{itemData.item.title}}</div>
     *    <ws:if data="{{!itemData.isSwiped()}}">
     *      <ws:partial template="{{itemActionsTemplate}}"
     *                  attr:class="some-custom-class-for-itemActions"
     *                  itemData="{{itemData}}"
     *                  scope="{{_options}}"/>
     *    </ws:if>
     *  <div>{{itemData.item.description}}</div>
     * </pre>
     *
     */
    itemActionsPosition?: TItemActionsPosition;

    /**
     * @name Controls/_itemActions/interface/IItemActionsOptions#itemActionsProperty
     * @cfg {String} Имя свойства, которое содержит конфигурацию для панели с опциями записи.
     * @remark
     * Функционал используют в тех случаях, когда опции записи привязаны к отображаемым данным.
     * Настройка для опций записи извлекается из данных самого элемента.
     * Подробнее о работе с опциями записи читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/item-actions/ здесь}.
     * @example
     * <pre class="brush: js">
     * _beforeMount: function(newOptions) {
     *    this._viewSource = new source.Memory({
     *       keyProperty: 'id',
     *       data: [
     *          {
     *             id: 0,
     *             title: 'The agencies’ average client makes about $32,000 a year.',
     *             itemActions: [
     *                {
     *                   id: 1,
     *                   title: 'Прочитано',
     *                   showType: TItemActionShowType.TOOLBAR,
     *                },
     *                {
     *                   id: 2,
     *                   icon: 'icon-PhoneNull',
     *                   title: 'Позвонить',
     *                   showType: TItemActionShowType.MENU_TOOLBAR,
     *                },
     *                {
     *                   id: 3,
     *                   icon: 'icon-EmptyMessage',
     *                   title: 'Написать',
     *                   showType: TItemActionShowType.TOOLBAR,
     *                }
     *             ]
     *          },
     *          ...
     *       ]
     *    });
     * }
     * </pre>
     * @see itemActions
     * @see itemActionsPosition
     * @see actionCaptionPosition
     * @see itemActionVisibilityCallback
     * @see actionClick
     * @see actionAlignment
     */

    /*ENG
     * @name Controls/_itemActions/interface/IItemActionsOptions#itemActionsProperty
     * @cfg {String} Name of the item's property that contains item actions.
     */
    itemActionsProperty?: string;

    /**
     * @name Controls/_itemActions/interface/IItemActionsOptions#actionAlignment
     * @cfg {Controls/_itemActions/interface/IItemActionsTemplateConfig/TActionAlignment.typedef} Выравнивание опций записи, когда они отображаются в режиме swipe.
     * @remark
     * См. <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FSwipe%2FScenarios">демо-пример</a>.
     * Подробнее о работе с опциями записи читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/item-actions/ здесь}.
     * @see itemActions
     * @see itemActionsPosition
     * @see itemActionVisibilityCallback
     * @see itemActionsProperty
     * @see actionClick
     * @see actionCaptionPosition
     */

    /*ENG
     * @name Controls/_itemActions/interface/IItemActionsOptions#actionAlignment
     * @cfg {Controls/_itemActions/interface/IItemActionsTemplateConfig/TActionAlignment.typedef} Determines how item actions will be aligned on swipe.
     * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FSwipe%2FScenarios">Example</a>.
     * @variant horizontal Actions will be displayed in a line.
     * @variant vertical Actions will be displayed in a line.
     */
    actionAlignment?: TActionAlignment;

    /**
     * @name Controls/_itemActions/interface/IItemActionsOptions#actionCaptionPosition
     * @cfg {Controls/_itemActions/interface/IItemAction/TActionCaptionPosition.typedef} Позиция заголовка для опций записи, когда они отображаются в режиме swipe.
     * @remark
     * См. <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FSwipe%2FScenarios">демо-пример</a>.
     * Подробнее о работе с опциями записи читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/item-actions/ здесь}.
     * @see itemActions
     * @see itemActionsPosition
     * @see itemActionVisibilityCallback
     * @see itemActionsProperty
     * @see actionClick
     * @see actionAlignment
     */

    /*ENG
     * @name Controls/_itemActions/interface/IItemActionsOptions#actionCaptionPosition
     * @cfg {Controls/_itemActions/interface/IItemAction/TActionCaptionPosition.typedef} Determines where the caption of an item action will be displayed on swipe.
     * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FSwipe%2FScenarios">Example</a>.
     * @variant right Title will be displayed to the right of the action's icon.
     * @variant bottom Title will be displayed under the action's icon.
     * @variant none Title will not be displayed.
     */
    actionCaptionPosition?: TActionCaptionPosition;

    /**
     * @name Controls/_itemActions/interface/IItemActionsOptions#itemActionsVisibility
     * @cfg {TItemActionsVisibility} Настройка способа отображения опций записи
     * @variant onhover Опции записи отображаются при наведении на запись.
     * @variant visible Опции записи отображены изначально.
     * @variant delayed Опции записи отображаются при наведении на запись и удержании над ней курсора мыши в течение 500 мс.
     * @remark Подробнее о работе с опциями записи читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/item-actions/ здесь}.
     */

    /*
     * @name Controls/_itemActions/interface/IItemActionsOptions#itemActionsVisibility
     * @cfg {TItemActionsVisibility} Setting of ItemActions visibility
     * @variant onhover ItemActions will be Initialized and displayed right after mouseenter over Item
     * @variant visible ItemActions will be Initialized and displayed on control mount
     * @variant delayed ItemActions will be Initialized and displayed after mouseenter with 500ms delay over Item
     */
    itemActionsVisibility?: TItemActionsVisibility;

    /**
     * @name Controls/_itemActions/interface/IItemActionsOptions#itemActionVisibilityCallback
     * @cfg {Function} Функция обратного вызова для определения видимости опций записи.
     * @remark
     * Функция принимает два аргумента:
     *
     * * action — объект с конфигурацией опции записи.
     * * item — модель (см. {@link Types/entity:Model}), содержащая данные записи.
     *
     * Чтобы опция записи отображалась, из функции следует вернуть true.
     * Подробнее о работе с опциями записи читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/item-actions/ здесь}.
     * @example
     * Режим "Чтение" недоступен, если запись имеет свойство isNew === false.
     *
     * <pre class="brush: html">
     * <!-- WML -->
     * <Controls.list:View
     *     attr:class="demo-News"
     *     itemActions="{{_itemActions}}"
     *     source="{{_source}}"
     *     actionAlignment="vertical"
     *     actionCaptionPosition="bottom"
     *     markerVisibility="hidden"
     *     itemActionVisibilityCallback="{{_visibilityCallback}}"
     *     ...
     * </Controls.list:View>
     * </pre>
     *
     * <pre class="brush: js">
     * // TypeScript
     *  ...
     *  private _visibilityCallback(action: IItemAction, item: Model): boolean {
     *   if (action.title === 'Read') {
     *     return item.get('isNew');
     *   }
     *   return true;
     *  }
     *  ...
     * </pre>
     * @see itemActions
     * @see itemActionsPosition
     * @see actionCaptionPosition
     * @see itemActionsProperty
     * @see actionClick
     * @see actionAlignment
     */

    /*ENG
     * @name Controls/_itemActions/interface/IItemActionsOptions#itemActionVisibilityCallback
     * @cfg {Function} item operation visibility filter function
     * @param {ItemAction} action Object with configuration of an action.
     * @param {Types/entity:Model} item Instance of the item whose action is being processed.
     * @returns {Boolean} Determines whether the action should be rendered.
     * @example
     * Item action Read don't display if item has property isNew === false
     * <pre>
     *    <Controls.list:View attr:class="demo-News"
     *                        itemActions="{{_itemActions}}"
     *                        source="{{_source}}"
     *                        actionAlignment="vertical"
     *                        actionCaptionPosition="bottom"
     *                        markerVisibility="hidden"
     *                        itemActionVisibilityCallback="{{_visibilityCallback}}"
     *                        ...
     *   </Controls.list:View>
     * </pre>
     * <pre>
     *  ...
     *  private _visibilityCallback(action: IItemAction, item: Model): boolean {
     *   if (action.title === 'Read') {
     *     return item.get('isNew');
     *   }
     *   return true;
     *  }
     *  ...
     * </pre>
     */
    itemActionVisibilityCallback?: TItemActionVisibilityCallback;

    /**
     * @name Controls/_itemActions/itemActions/interface/IItemActionsOptions#itemActionsClass
     * @cfg {String} CSS класс, позволяющий задать отступы и позицию панели с {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/item-actions/ опциями записи} внутри элемента.
     * @default controls-itemActionsV_position_bottomRight
     * @deprecated Используйте {@link Controls/list:ItemTemplate#itemActionsClass itemActionsClass} как опцию {@link Controls/list:ItemTemplate}.
     */
    /*
     * @name Controls/_itemActions/itemActions/interface/IItemActionsOptions#itemActionsClass
     * @cfg {Controls/itemActions:TActionCaptionPosition} CSS class, allowing to set position and padding for actions panel relative to record
     */
    /*
     * @TODO Вероятно, будет удалён согласно https://online.sbis.ru/opendoc.html?guid=f874f976-0ccd-4d56-99a6-4b3bd4669591
     */
    itemActionsClass?: string;
}

/**
 * @event Происходит при клике по {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/item-actions/index/ опции записи}.
 * @name Controls/_itemActions/interface/IItemActionsOptions#actionClick
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Controls/itemActions:IItemAction} action Объект с конфигурацией опции записи, по которой выполнили клик.
 * @param {Types/entity:Model} item Экземпляр записи, для которой была отображена опция записи.
 * @param {HTMLElement} itemContainer Контейнер записи, по которой был выполнен клик.
 * @param {Event} nativeEvent Дескриптор исходного события браузера. Может использоваться для получения информации о том, какие клавиши-модификаторы были использованы при клике (Ctrl etc.)
 * @remark Подробнее о работе с опциями записи читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/item-actions/ здесь}.
 * @see itemActions
 * @see itemActionsPosition
 * @see itemActionVisibilityCallback
 * @see itemActionsProperty
 * @see actionAlignment
 * @see actionCaptionPosition
 */

/*ENG
 * @event Occurs when itemAction button is clicked.
 * @name Controls/_itemActions/interface/IItemActionsOptions#actionClick
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Controls/itemActions:IItemAction} action Object with configuration of the clicked action.
 * @param {Types/entity:Model} item Instance of the item whose action was clicked.
 * @param {HTMLElement} itemContainer Container of the item whose action was clicked.
 * @param {Event} nativeEvent Native browser event
 */
