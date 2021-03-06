/**
 * Упрощенный шаблон отображения элементов в  {@link Controls/tile:View плитке}.
 * @class Controls/tile:SmallTemplate
 * @mixes Controls/tile:ItemTemplate
 * @author Михайлов С.Е
 * @see Controls/tile:View
 * @example
 * <pre class="brush: html">
 * <Controls.tile:View>
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/tile:SmallTemplate"
 *                   imageSize="m">
 *       </ws:partial>
 *    </ws:itemTemplate>
 * </Controls.tile:View>
 * </pre>
 * @public
 * @demo Controls-demo/Tile/DifferentItemTemplates/SmallTemplate/Index
 * @remark
 * Шаблон имеет фиксированную высоту. Опция tileHeight не учитывается.
 */

export default interface ISmallTemplateOptions {
    /**
     * @typedef {String} ImageSize
     * @variant s Размер, соответствующий размеру s.
     * @variant m Размер, соответствующий размеру m.
     */
    /**
     * @name Controls/tile:SmallTemplate#imageSize
     * @cfg {ImageSize} Размер изображения.
     */
    imageSize?: 's' | 'm';
}
