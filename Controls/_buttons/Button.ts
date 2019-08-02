import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import ButtonTemplate = require('wml!Controls/_buttons/Button');
import ActualApi from './ActualApi';
import {IHref, IHrefOptions} from './interface/IHref';
import {IClick} from './interface/IClick';
import {ITooltip, ITooltipOptions,
   ICaption, ICaptionOptions,
   IIcon, IIconOptions,
   IIconStyle, IIconStyleOptions,
   IIconSize, IIconSizeOptions,
   IFontColorStyle, IFontColorStyleOptions,
   IFontSize, IFontSizeOptions,
   IHeight, IHeightOptions
} from 'Controls/interface';
import {SyntheticEvent} from 'Vdom/Vdom';

export interface IButtonOptions extends IControlOptions, IHrefOptions, ICaptionOptions, IIconOptions,
   IIconStyleOptions, IIconSizeOptions, IFontColorStyleOptions, IFontSizeOptions, IHeightOptions, ITooltipOptions {
   contrastBackground?: boolean;
   buttonStyle?: string;
   viewMode?: string;
}

/**
 * Графический контрол, который предоставляет пользователю возможность простого запуска события.
 *
 * <a href="/materials/demo-ws4-buttons">Демо-пример</a>.
 *
 * @class Controls/_buttons/Button
 * @extends Core/Control
 * @mixes Controls/_buttons/interface/IHref
 * @mixes Controls/_interface/ICaption
 * @mixes Controls/_buttons/interface/IClick
 * @mixes Controls/_interface/IIcon
 * @mixes Controls/_interface/IIconStyle
 * @mixes Controls/_interface/IIconSize
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_interface/IHeight
 * @mixes Controls/_interface/ITooltip
 * @control
 * @public
 * @author Красильников А.С.
 * @category Button
 * @demo Controls-demo/Buttons/ButtonDemoPG
 */

/*
 * Graphical control element that provides the user a simple way to trigger an event.
 *
 * <a href="/materials/demo-ws4-buttons">Demo-example</a>.
 *
 * @class Controls/_buttons/Button
 * @extends Core/Control
 * @mixes Controls/_buttons/interface/IHref
 * @mixes Controls/_interface/ICaption
 * @mixes Controls/_buttons/interface/IClick
 * @mixes Controls/_interface/IIcon
 * @mixes Controls/_interface/IIconStyle
 * @mixes Controls/_interface/IIconSize
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_interface/IHeight
 * @mixes Controls/_interface/ITooltip
 * @control
 * @public
 * @author Красильников А.С.
 * @category Button
 * @demo Controls-demo/Buttons/ButtonDemoPG
 */

/**
 * @name Controls/_buttons/Button#viewMode
 * @cfg {Enum} Режим отображения кнопки.
 * @variant link Декорированная гиперссылка.
 * @variant button Кнопка по умолчанию.
 * @variant toolButton Кнопка панели инструментов.
 * @default button
 * @example
 * Кнопка в режиме отображения 'link'.
 * <pre>
 *    <Controls.buttons:Path caption="Send document" style="primary" viewMode="link" size="xl"/>
 * </pre>
 * Кнопка в режиме отображения 'toolButton'.
 * <pre>
 *    <Controls.buttons:Path caption="Send document" style="danger" viewMode="toolButton"/>
 * </pre>
 * Кнопка в режиме отображения 'button'.
 * <pre>
 *    <Controls.buttons:Path caption="Send document" style="success" viewMode="button"/>
 * </pre>
 * @see Size
 */

/*
 * @name Controls/_buttons/Button#viewMode
 * @cfg {Enum} Button view mode.
 * @variant link Decorated hyperlink.
 * @variant button Default button.
 * @variant toolButton Toolbar button.
 * @default button
 * @example
 * Button with 'link' viewMode.
 * <pre>
 *    <Controls.buttons:Path caption="Send document" style="primary" viewMode="link" size="xl"/>
 * </pre>
 * Button with 'toolButton' viewMode.
 * <pre>
 *    <Controls.buttons:Path caption="Send document" style="danger" viewMode="toolButton"/>
 * </pre>
 * Button with 'button' viewMode.
 * <pre>
 *    <Controls.buttons:Path caption="Send document" style="success" viewMode="button"/>
 * </pre>
 * @see Size
 */

/**
 * @name Controls/_buttons/Button#contrastBackground
 * @cfg {Boolean} Определяет прозрачность фона кнопки.
 * @default false
 * @remark
 * * true - непрозрачный фон. 
 * * false - прозрачный фон.
 * @example
 * Кнопка имеет прозрачный фон.
 * <pre>
 *    <Controls.buttons:Button caption="Send document" style="primary" viewMode="toolButton" size="l"/>
 * </pre>
 * У кнопки непрозрачный фон.
 * <pre>
 *    <Controls.buttons:Button caption="Send document" style="primary" viewMode="toolButton" contrastBackground="{{true}}" />
 * </pre>
 * @see style
 */

/*
 * @name Controls/_buttons/Button#contrastBackground
 * @cfg {Boolean} Determines if button has contrast background.
 * @default true
 * @remark
 * true - Button has contrast background
 * false - Button has the harmony background.
 * @example
 * Button has transparent background.
 * <pre>
 *    <Controls.Button caption="Send document" style="primary" viewMode="toolButton" contrastBackground="{{false}}" size="l"/>
 * </pre>
 * Button hasn't transparent background.
 * <pre>
 *    <Controls.Button caption="Send document" style="primary" viewMode="toolButton" />
 * </pre>
 * @see style
 */

/**
 * @name Controls/_buttons/Button#buttonStyle
 * @cfg {Enum} Устанавливает параметры стиля для кнопки. Это цвет фона или цвет границы для различных значений режима отображения (viewMode).
 * @variant primary
 * @variant secondary
 * @default secondary
 * @example
 * Кнопка со стилем "Primary" с иконкой по умолчанию.
 * <pre>
 *    <Controls.buttons:Button viewMode="button" buttonStyle="primary"/>
 * </pre>
 */

/*
 * @name Controls/_buttons/Button#buttonStyle
 * @cfg {Enum} Set style parameters for button. These are background color or border color for different values of viewMode
 * @variant primary
 * @variant secondary
 * @variant success
 * @variant warning
 * @variant danger
 * @default secondary
 * @example
 * Primary button with default icon style.
 * <pre>
 *    <Controls.buttons:Button viewMode="button" buttonStyle="primary"/>
 * </pre>
 */
class Button extends Control<IButtonOptions> implements
      IHref, ICaption, IIcon, IIconStyle, ITooltip, IIconSize, IClick, IFontColorStyle, IFontSize, IHeight {
   protected _template: TemplateFunction = ButtonTemplate;

   // Называть _style нельзя, так как это состояние используется для темизации
   private _buttonStyle: string;
   private _fontColorStyle: string;
   private _fontSize: string;
   private _contrastBackground: boolean;
   private _hasIcon: boolean;
   private _viewMode: string;
   private _height: string;
   private _state: string;
   private _caption: string | TemplateFunction;
   private _stringCaption: boolean;
   private _icon: string;
   private _iconSize: string;
   private _iconStyle: string;

   private cssStyleGeneration(options: IButtonOptions): void {
      const currentButtonClass = ActualApi.styleToViewMode(options.style);
      const oldViewModeToken = ActualApi.viewMode(currentButtonClass.viewMode, options.viewMode);

      this._buttonStyle = ActualApi.buttonStyle(currentButtonClass.style, options.style, options.buttonStyle, options.readOnly);
      this._contrastBackground = ActualApi.contrastBackground(options);
      this._viewMode = oldViewModeToken.viewMode;
      if (typeof oldViewModeToken.contrast !== 'undefined') {
         this._contrastBackground = oldViewModeToken.contrast;
      }
      this._height = ActualApi.actualHeight(options.size, options.inlineHeight, this._viewMode);
      this._fontColorStyle = ActualApi.fontColorStyle(this._buttonStyle, this._viewMode, options.fontColorStyle);
      this._fontSize = ActualApi.fontSize(options);
      this._hasIcon = !!options.icon;

      this._caption = options.caption;
      this._stringCaption = typeof options.caption === 'string';

      this._icon = options.icon;
      this._iconSize = ActualApi.iconSize(options);
      this._iconStyle = ActualApi.iconStyle(options);
   }

   protected _beforeMount(options: IButtonOptions): void {
      this.cssStyleGeneration(options);
   }

   protected _beforeUpdate(newOptions: IButtonOptions): void {
      this.cssStyleGeneration(newOptions);
   }

   private _keyUpHandler(e: SyntheticEvent): void {
      if (e.nativeEvent.keyCode === 13 && !this._options.readOnly) {
         this._notify('click');
      }
   }

   private _clickHandler(e: SyntheticEvent): void {
      if (this._options.readOnly) {
         e.stopPropagation();
      }
   }

   static _theme: string[] = ['Controls/buttons', 'Controls/Classes'];

   static getDefaultOptions(): object {
      return {
         viewMode: 'button',
         iconStyle: 'secondary',
         theme: 'default'
      };
   }
}

export default Button;
