import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {IBreadCrumbsOptions} from './interface/IBreadCrumbs';
import BreadCrumbsUtil from './Utils';
import {ItemsUtil} from 'Controls/list';
import {tmplNotify} from 'Controls/eventUtils';
import {applyHighlighter} from 'Controls/_breadcrumbs/resources/applyHighlighter';
import template = require('wml!Controls/_breadcrumbs/HeadingPath/HeadingPath');
import Common from './HeadingPath/Common';
import 'Controls/heading';
import 'wml!Controls/_breadcrumbs/HeadingPath/Back';
import {Record, Model} from 'Types/entity';
import {Logger} from "UI/Utils";
import {getFontWidth, loadFontWidthConstants} from "../Utils/getFontWidth";

//TODO удалить, когда появится возможность находить значение ширины иконок и отступов.
const ARROW_WIDTH = 16;
const BREAD_CRUMB_MIN_WIDTH = ARROW_WIDTH + 28;
const PADDING_RIGHT = 2;

interface IReceivedState {
    items: Record[];
}

/**
 * Хлебные крошки с кнопкой "Назад".
 *
 * @remark
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FBreadCrumbs%2FScenarios">демо-пример</a>
 * * <a href="https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/content-managment/bread-crumbs/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_breadcrumbs.less">переменные тем оформления</a>
 *
 * @class Controls/_breadcrumbs/HeadingPath
 * @extends Core/Control
 * @mixes Controls/interface/IBreadCrumbs
 * @mixes Controls/interface/IHighlighter
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/IFontSize
 * @control
 * @public
 * @author Авраменко А.С.
 * @demo Controls-demo/BreadCrumbs/PathPG
 * @see Controls/_breadcrumbs/Path
 */

/*
 * Breadcrumbs with back button.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FBreadCrumbs%2FScenarios">Demo</a>.
 *
 * @class Controls/_breadcrumbs/HeadingPath
 * @extends Core/Control
 * @mixes Controls/interface/IBreadCrumbs
 * @mixes Controls/interface/IHighlighter
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/IFontSize
 * @control
 * @public
 * @author Авраменко А.С.
 *
 * @demo Controls-demo/BreadCrumbs/PathPG
 */

/**
 * @name Controls/_breadcrumbs/HeadingPath#backButtonIconStyle
 * @cfg {String} Стиль отображения иконки кнопки "Назад".
 * @see Controls/_heading/Back#iconStyle
 */

/**
 * @name Controls/_breadcrumbs/HeadingPath#backButtonFontColorStyle
 * @cfg {String} Стиль цвета кнопки "Назад".
 * @see Controls/_heading/Back#fontColorStyle
 */

/**
 * @name Controls/_breadcrumbs/HeadingPath#displayMode
 * @cfg {Boolean} Отображение крошек в несколько строк
 * @variant default
 * @variant multiline
 * @default default
 * @demo Controls-demo/BreadCrumbs/DisplayMode/Index
 */

/**
 * @event Controls/_breadcrumbs/HeadingPath#arrowActivated Происходит при клике на кнопку "Просмотр записи".
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 */

/*
 * @event Controls/_breadcrumbs/HeadingPath#arrowActivated Happens after clicking the button "View Model".
 * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
 */

/**
 * @name Controls/_breadcrumbs/HeadingPath#showActionButton
 * @cfg {Boolean} Определяет, должна ли отображаться стрелка рядом с кнопкой "Назад".
 * @default
 * true
 */

/*
 * @name Controls/_breadcrumbs/HeadingPath#showActionButton
 * @cfg {Boolean} Determines whether the arrow near "back" button should be shown.
 * @default
 * true
 */

/**
 * @name Controls/_breadcrumbs/HeadingPath#afterBackButtonTemplate
 * @cfg {Function|string} Шаблон, который расположен между кнопкой назад и хлебными крошками
 * @example
 * <pre>
 *    <Controls.breadcrumbs:HeadingPath
 *          items="{{_items}}"
 *          parentProperty="parent"
 *          keyProperty="id"
 *          on:itemClick="_onItemClick()">
 *       <ws:afterBackButtonTemplate>
 *          <h3>Custom content</h3>
 *       </ws:afterBackButtonTemplate>
 *    </Controls.breadcrumbs:HeadingPath>
 * </pre>
 */

class BreadCrumbsPath extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _backButtonCaption: string = '';
    protected _visibleItems: Record[];
    protected _breadCrumbsItems: Record[];
    protected _backButtonClass: string = '';
    protected _breadCrumbsClass: string = '';
    protected _viewUpdated: boolean = false;
    protected _notifyHandler: Function = tmplNotify;
    protected _applyHighlighter = applyHighlighter;
    protected _getRootModel: Function = Common.getRootModel;
    protected _dotsWidth: number = 0;
    protected _items: Record[];
    protected _width: number;

    protected _beforeMount(options?: IBreadCrumbsOptions, contexts?: object, receivedState?: IReceivedState): Promise<IReceivedState> | void {
        if (!options.containerWidth) {
            Logger.error('Path: option containerWidth is undefined', this);
            loadFontWidthConstants().then(() => {
                return;
            });
        } else if (receivedState) {
            this._dotsWidth = this._getDotsWidth(options.fontSize);
            this._drawItems(options, options.containerWidth);
        } else {
            return new Promise((resolve) => {
                loadFontWidthConstants().then((getTextWidth: Function) => {
                    if (options.items && options.items.length > 0) {
                        this._dotsWidth = this._getDotsWidth(options.fontSize, getTextWidth);
                        this._drawItems(options, options.containerWidth, getTextWidth);
                    }
                    resolve({
                            items: this._items
                        }
                    );
                });
            });
        }
    }

    /*_beforeMount: function (options) {
        if (options.items && options.items.length > 0) {
            _private.drawItems(this, options);
        }
    },
    _beforeUpdate: function (newOptions) {

        if (BreadCrumbsUtil.shouldRedraw(this._options.items, newOptions.items)) {
            _private.drawItems(this, newOptions);
        }
    },

    _afterUpdate: function() {
        if (this._viewUpdated) {
            this._viewUpdated = false;
        }
    }*/
    private _drawItems(options: IBreadCrumbsOptions, width: number, getTextWidth: Function = this._getTextWidth): void {
        this._backButtonCaption = ItemsUtil.getPropertyValue(options.items[options.items.length - 1], options.displayProperty);

        //containerWidth is equal to 0, if path is inside hidden node. (for example switchableArea)
        if (options.items.length > 1) {
            this._breadCrumbsItems = options.items.slice(0, options.items.length - 1);
            this._items = options.items;
            this._width = width;
            this._calculateBreadCrumbsToDraw(this._breadCrumbsItems, options, getTextWidth);
            this._breadCrumbsClass = 'controls-BreadCrumbsPath__breadCrumbs_short';

        } else {
            this._visibleItems = null;
            this._breadCrumbsItems = null;
            this._backButtonClass = '';
            this._breadCrumbsClass = '';
        }
        this._viewUpdated = true;
    }

    private _getDotsWidth(fontSize: string, getTextWidth: Function = this._getTextWidth): number {
        const dotsWidth = getTextWidth('...', fontSize) + PADDING_RIGHT;
        return ARROW_WIDTH + dotsWidth;
    }
    private _getTextWidth(text: string, size: string  = 'xs'): number {
        return getFontWidth(text, size);
    }
    private _calculateBreadCrumbsToDraw(items: Record[], options: IBreadCrumbsOptions, getTextWidth: Function = this._getTextWidth): void {
        this._visibleItems = [];
        this._visibleItems = BreadCrumbsUtil.calculateItemsWithDots(items, options, 0, this._width, this._dotsWidth, getTextWidth);
        this._visibleItems[0].hasArrow = false;
    }

    private _onBackButtonClick(e: Event): void {
        Common.onBackButtonClick.call(this, e);
    }
    private _onHomeClick(): void {
       /**
        * TODO: _options.root is actually current root, so it's wrong to use it. For now, we can take root from the first item. Revert this commit after:
        * https://online.sbis.ru/opendoc.html?guid=93986788-48e1-48df-9595-be9d8fb99e81
        */
       this._notify('itemClick', [this._getRootModel(this._options.items[0].get(this._options.parentProperty), this._options.keyProperty)]);
    }

   private _getCounterCaption(items: Record[]): void {
      return items[items.length - 1].get('counterCaption');
   }
    static getDefaultOptions() {
        return {
            displayProperty: 'title',
            root: null,
            backButtonIconStyle: 'primary',
            backButtonFontColorStyle: 'secondary',
            showActionButton: true,
            displayMode: 'default'
        };
    }
    static _styles: string[] = ['Controls/_breadcrumbs/resources/FontLoadUtil'];
    static _theme: string[] = ['Controls/crumbs', 'Controls/heading'];
}

export default BreadCrumbsPath;
