import {TemplateFunction} from 'UI/Base';
/**
 * Шаблон для отображения элементов в режиме превью в {@link Controls/tile:View плитке}.
 * @class Controls/tile:PreviewTemplate
 * @mixes Controls/tile:ItemTemplate
 * @author Михайлов С.Е
 * @see Controls/tile:View
 * @example
 * <pre class="brush: html">
 * <Controls.tile:View>
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/tile:PreviewTemplate"
 *                   titleStyle="dark"
 *                   gradientType="light"
 *                   titleLines="2">
 *       </ws:partial>
 *    </ws:itemTemplate>
 * </Controls.tile:View>
 * </pre>
 * @public
 * @demo Controls-demo/Tile/DifferentItemTemplates/PreviewTemplate/Index
 */

export default interface IPreviewTemplateOptions {
    /**
     * @name Controls/tile:PreviewTemplate#titleLines
     * @cfg {Number} Количество строк в заголовке.
     */
    titleLines?: number;
    /**
     * @typedef {String} TitleStyle
     * @variant light Светлый заголовок.
     * @variant dark Темный заголовок.
     */

    /**
     * @name Controls/tile:PreviewTemplate#titleStyle
     * @cfg {TitleStyle} Стиль отображения заголовка плитки.
     * @default light
     * @see gradientType
     */
    titleStyle?: 'light' | 'dark';
    /**
     * @typedef {String} GradientType
     * @variant light Светлый градиент у заголовка.
     * @variant dark Темный градиент у заголовока.
     * @variant custom Пользовательский цвет градиента.
     */

    /**
     * @name Controls/tile:PreviewTemplate#gradientType
     * @cfg {GradientType} Тип отображения градиента.
     * @see gradientColor
     */
    gradientType?: 'light' | 'dark' | 'custom';

    /**
     * @name Controls/tile:PreviewTemplate#gradientColor
     * @cfg {String} Цвет градиента. Можно указывать в любом формате, который поддерживается в CSS.
     * @default #FFF
     * @see gradientType
     */
    gradientColor?: string;
    /**
     * @name Controls/tile:PreviewTemplate#bottomRightTemplate
     * @cfg {TemplateFunction} Шаблон справа от заголовка плитки.
     * @default #FFF
     * @see gradientType
     */
    bottomRightTemplate: TemplateFunction;
    /**
     * @name Controls/tile:PreviewTemplate#footerTemplate
     * @cfg {TemplateFunction} Шаблон подвала элемента.
     * @default #FFF
     * @see gradientType
     */
    footerTemplate: TemplateFunction;

    /**
     * @name Controls/tile:PreviewTemplate#topTemplate
     * @cfg {TemplateFunction} Шаблон шапки элемента.
     * @default #FFF
     * @see gradientType
     */
    topTemplate: TemplateFunction;
}
