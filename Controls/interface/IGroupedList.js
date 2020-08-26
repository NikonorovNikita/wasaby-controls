/* eslint-disable */
define('Controls/interface/IGroupedList', [
], function() {

   /**
    * Интерфейс для контролов, реализующих группировку элементов.
    *
    * @interface Controls/interface/IGroupedList
    * @public
    * @author Авраменко А.С.
    */

   /**
    * @name Controls/interface/IGroupedList#groupProperty
    * @cfg {String} Имя свойства, содержащего идентификатор группы элемента списка.
    * @demo Controls-demo/list_new/Grouped/HiddenGroup/Index
    * @remark
    * "Элементы списка могут отображаться в группе без заголовка. Подробнее читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/list/grouping/extend/#without-header">здесь</a>.
    * @see groupTemplate
    * @see collapsedGroups
    * @see groupHistoryId
    * @see groupExpanded
    * @see groupCollapsed
    */

   /**
    * @name Controls/interface/IGroupedList#groupTemplate
    * @cfg {String|Function} Устанавливает шаблон отображения заголовка группы.
    * @default Controls/list:GroupTemplate
    * @remark
    * См. <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FGroupPG">демо-пример</a>.
    * Подробнее о параметрах шаблона Controls/list:GroupTemplate читайте {@link Controls/list:GroupTemplate здесь}.
    * Подробнее о работе с шаблоном читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/grouping/basic/#header-group здесь}.
    * @example
    * Далее показано как изменить параметры шаблона на примере контрола Controls/list:View, однако то же самое справедливо и для других {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/ списочных контролов}..
    * <pre class="brush: html">
    * <Controls.list:View>
    *    <ws:groupTemplate>
    *       <ws:partial template="Controls/list:GroupTemplate"
    *          separatorVisibility="{{false}}"
    *          expanderVisible="{{false}}"
    *          textAlign="left"
    *          scope="{{groupTemplate}}">
    *          <ws:contentTemplate>
    *             <ws:if data="{{contentTemplate.itemData.item === 'nonexclusive'}}">Неисключительные права</ws:if>
    *             <ws:if data="{{contentTemplate.itemData.item === 'works'}}">Работы</ws:if>
    *          </ws:contentTemplate>
    *       </ws:partial>
    *    </ws:groupTemplate>
    * </Controls.list:View>
    * </pre>
    * @see collapsedGroups
    * @see groupProperty
    * @see groupHistoryId
    */

   /**
    * @name Controls/interface/IGroupedList#collapsedGroups
    * @cfg {Array.<String>} Список идентификаторов свернутых групп. Идентификаторы групп получаются из свойства {@link groupProperty}.
    * @remark
    * См. <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FGroupPG">демо-пример</a>.
    * @see groupTemplate
    * @see groupProperty
    * @see groupHistoryId
    */

   /**
    * @name Controls/interface/IGroupedList#groupHistoryId
    * @cfg {String} Идентификатор для сохранения в истории списка идентификаторов свернутых групп.
    * @see groupTemplate
    * @see groupProperty
    * @see collapsedGroups
    */

   /**
    * @event Controls/interface/IGroupedList#groupExpanded Происходит при развертывании группы.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {String} changes Идентификатор группы.
    * @demo Controls-demo/List/List/GroupPG
    * @see groupCollapsed
    */

   /**
    * @event Controls/interface/IGroupedList#groupCollapsed Происходит при сворачивании группы.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {String} changes Идентификатор группы.
    * @demo Controls-demo/List/List/GroupPG
    * @see groupExpanded
    */

});

