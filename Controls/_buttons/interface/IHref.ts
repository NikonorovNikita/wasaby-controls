export interface IHrefOptions {
   href?: string;
}
/**
 * Интерфейс для кнопок со ссылками.
 *
 * @interface Controls/_buttons/interface/IHref
 * @public
 */

/*
 * Interface for buttons with href links.
 *
 * @interface Controls/_buttons/interface/IHref
 * @public
 */
export interface IHref {
   readonly '[Controls/_buttons/interface/IHref]': boolean;
}
/**
 * @name Controls/_buttons/interface/IHref#href
 * @cfg {String} Задает адрес документа, на который следует перейти. 
 * @default Undefined
 * @remark Если необходимо открыть вложенный документ на новой вкладке, используйте attr:target="_blank".
 * @example
 * При клике по кнопке переходим на google.com
 * <pre>
 *    <Controls.buttons:Button href="https://www.google.com/" icon="icon-Add" buttonStyle="primary" viewMode="button"/>
 * </pre>
 */

/*
 * @name Controls/_buttons/interface/IHref#href
 * @cfg {String} Specifies the linked resource.
 * @default Undefined
 * @remark This options is analog of html href. If you need to open the attached document in a new tab, use the attr:target="_blank"
 * @example
 * When button pressed, we go to google.com
 * <pre>
 *    <Controls.buttons:Button href="https://www.google.com/" icon="icon-Add" buttonStyle="primary" viewMode="button"/>
 * </pre>
 */