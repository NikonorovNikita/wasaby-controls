/**
 * Шаблон, который по умолчанию используется для отображения {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/grid/header/ заголовка колонки} в {@link Controls/grid:View табличном представлении}.
 * @class Controls/grid:HeaderContent
 * @author Авраменко А.С.
 * @see Controls/_grid/interface/IGridControl/HeaderCell.typedef
 * @see Controls/grid:IGridControl#header
 * @remark
 * Подробнее о шаблоне:
 * 
 * * {@link Controls/grid:IHeaderContentOptions Параметры шаблона}
 * * {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/grid/templates/header/ Руководство разработчика}
 */

/**
 * Интерфейс для {@link Controls/grid:HeaderContent шаблона заголовка колонки} в {@link Controls/grid:View табличном представлении}.
 * @class Controls/grid:IHeaderContentOptions
 * @author Авраменко А.С.
 */

/**
 * @name Controls/grid:IHeaderContentOptions#contentTemplate
 * @cfg {String|Function} Вёрстка, описывающая содержимое ячейки.
 * @remark
 * В области видимости шаблона доступен объект **colData**. Через него можно получить доступ к свойству **column**, которое содержит конфигурацию {@link https://wi.sbis.ru/docs/js/Controls/grid/IGridControl/typedefs/HeaderCell/ ячейки шапки}.
 */

export default interface IHeaderContentOptions {
   contentTemplate?: string;
}