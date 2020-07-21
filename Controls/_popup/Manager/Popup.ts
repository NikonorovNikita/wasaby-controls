import {constants, detection} from 'Env/Env';
import {debounce, delay as runDelayed} from 'Types/function';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {IPopupOptions} from 'Controls/_popup/interface/IPopup';
import {RegisterClass, RegisterUtil, UnregisterUtil} from 'Controls/event';

import * as template from 'wml!Controls/_popup/Manager/Popup';
import * as PopupContent from 'wml!Controls/_popup/Manager/PopupContent';

const RESIZE_DELAY = 10;
// on ios increase delay for scroll handler, because popup on frequent repositioning loop the scroll.
const SCROLL_DELAY = detection.isMobileIOS ? 100 : 10;

interface IPopupControlOptions extends IPopupOptions, IControlOptions {}

type UpdateCallback = () => void;

class Popup extends Control<IPopupControlOptions> {

    /**
     * Control Popup
     * @class Controls/_popup/Manager/Popup
     * @mixes Controls/interface/IOpenerOwner
     * @mixes Controls/interface/ICanBeDefaultOpener
     * @extends Core/Control
     * @control
     * @private
     * @category Popup
     * @author Красильников А.С.
     */

    /**
     * @name Controls/_popup/Manager/Popup#template
     * @cfg {Content} Template
     */

    /**
     * @name Controls/_popup/Manager/Popup#templateOptions
     * @cfg {Object} Template options
     */

    protected _template: TemplateFunction = template;
    protected _stringTemplate: boolean;
    protected waitForPopupCreated: boolean; // TODO: COMPATBILE
    protected callbackCreated: Function|null; // TODO: COMPATBILE

    private _isPopupMounted: boolean = false;

    // Register the openers that initializing inside current popup
    // After updating the position of the current popup, calls the repositioning of popup from child openers
    protected _openersUpdateCallback: UpdateCallback[] = [];

    protected _isEscDown: boolean = false;

    // _moduleName is assign in the callback of require.
    // Private modules are not visible for this mechanism,
    // _moduleName must be specified manually for them.
    // It is necessary for checking relationship between popups.
    protected _moduleName: string = 'Controls/_popup/Manager/Popup';
    private _resizeRegister: RegisterClass;
    private _isDragStarted: boolean;

    private _closeByESC(event: SyntheticEvent<KeyboardEvent>): void {
        if (event.nativeEvent.keyCode === constants.key.esc) {
            this._close();
        }
    }

    protected _beforePaintOnMount(): void {
        this._notify('popupBeforePaintOnMount', [this._options.id], {bubbling: true});
    }

    protected _beforeMount(options: IPopupControlOptions): void {
        this._stringTemplate = typeof options.template === 'string';
        this._compatibleTemplateName = this._getCompatibleTemplateName(options);
        this._resizeRegister = new RegisterClass({register: 'controlResize'});

        this._controlResizeHandler = debounce(this._controlResizeHandler.bind(this), RESIZE_DELAY, true);
        this._scrollHandler = debounce(this._scrollHandler.bind(this), SCROLL_DELAY);
    }

    //TODO: https://online.sbis.ru/opendoc.html?guid=728a9f94-c360-40b1-848c-e2a0f8fd6d17
    private _getCompatibleTemplateName(options: IPopupOptions): string {
        if (options.isCompoundTemplate) {
            return options.templateOptions.template;
        } else if (typeof options.template === 'string') {
            return options.template;
        }
    }

    protected _afterMount(): void {
        RegisterUtil(this, 'controlResize', this._controlResizeOuterHandler.bind(this));
        RegisterUtil(this, 'scroll', this._scrollHandler.bind(this));
        this._isPopupMounted = true;

        /* TODO: COMPATIBLE. You can't just count on afterMount position and zooming on creation
         * inside can be compoundArea and we have to wait for it, and there is an asynchronous phase. Look at the flag waitForPopupCreated */
        if (this.waitForPopupCreated) {
            this.callbackCreated = (() => {
                this.callbackCreated = null;
                this._notify('popupCreated', [this._options.id], {bubbling: true});
            });
        } else {
            this._notify('popupCreated', [this._options.id], {bubbling: true});
            this.activatePopup();
        }
    }

    protected _beforeUpdate(options: IPopupControlOptions): void {
        this._stringTemplate = typeof options.template === 'string';
    }

    protected _afterRender(oldOptions: IPopupOptions): void {
        this._notify('popupAfterUpdated', [this._options.id], {bubbling: true});

        if (this._isResized(oldOptions, this._options)) {
            this._startResizeRegister();
        }
    }

    private _startResizeRegister(event?: SyntheticEvent): void {
        const eventCfg = {
            type: 'controlResize',
            target: this,
            _bubbling: false
        };
        const customEvent = new SyntheticEvent(null, eventCfg);
        this._resizeRegister.start(event || customEvent);
    }

    protected _beforeUnmount(): void {
        if (this._resizeRegister) {
            this._resizeRegister.destroy();
        }
        UnregisterUtil(this, 'scroll');
        UnregisterUtil(this, 'controlResize');
        this._notify('popupDestroyed', [this._options.id], {bubbling: true});
    }

    protected _registerHandler(event, registerType, component, callback, config): void {
        this._resizeRegister.register(event, registerType, component, callback, config);
    }

    protected _unregisterHandler(event, registerType, component, config): void {
        this._resizeRegister.unregister(event, registerType, component, config);
    }
    /**
     * Close popup
     * @function Controls/_popup/Manager/Popup#_close
     */
    protected _close(): void {
        if (!this._isDragStarted) {
            this._notify('popupClose', [this._options.id], {bubbling: true});
        }
    }

    protected _maximized(event: SyntheticEvent<Event>, state: boolean): void {
        this._notify('popupMaximized', [this._options.id, state], {bubbling: true});
    }

    protected _popupDragStart(event: SyntheticEvent<Event>, offset: number): void {
        this._isDragStarted = true;
        this._notify('popupDragStart', [this._options.id, offset], {bubbling: true});
    }

    protected _popupDragEnd(): void {
        this._isDragStarted = false;
        this._notify('popupDragEnd', [this._options.id], {bubbling: true});
    }

    protected _popupMouseEnter(event: SyntheticEvent<MouseEvent>, popupEvent: SyntheticEvent<MouseEvent>): void {
        this._notify('popupMouseEnter', [this._options.id, popupEvent], {bubbling: true});
    }

    protected _popupMouseLeave(event: SyntheticEvent<MouseEvent>, popupEvent: SyntheticEvent<MouseEvent>): void {
        this._notify('popupMouseLeave', [this._options.id, popupEvent], {bubbling: true});
    }

    protected _popupResizingLine(event: SyntheticEvent<Event>, offset: number): void {
        this._notify('popupResizingLine', [this._options.id, offset], {bubbling: true});
    }

    protected _animated(event: SyntheticEvent<AnimationEvent>): void {
        this._startResizeRegister(event);
        this._notify('popupAnimated', [this._options.id], {bubbling: true});
    }

    protected _registerOpenerUpdateCallback(event: SyntheticEvent<Event>, callback: UpdateCallback): void {
        this._openersUpdateCallback.push(callback);
    }

    protected _unregisterOpenerUpdateCallback(event: SyntheticEvent<Event>, callback: UpdateCallback): void {
        const index = this._openersUpdateCallback.indexOf(callback);
        if (index > -1) {
            this._openersUpdateCallback.splice(index, 1);
        }
    }

    protected _callOpenersUpdate(): void {
        for (let i = 0; i < this._openersUpdateCallback.length; i++) {
            this._openersUpdateCallback[i]();
        }
    }

    protected _registerPendingHandler(event: Event): string {
        const args = this._prepareEventArs(event, arguments);
        const config = args[1] || {};
        config.root = this._options.id;
        args[1] = config;
        // catch showIndicator and add popupId property for Indicator.
        return this._notify('registerPending', args, {bubbling: true}) as string;
    }

    protected _finishPendingOperationsHandler(event: Event): string {
        const args = Array.prototype.slice.call(arguments, 1);
        args[1] = args[1] || this._options.id;
        // catch showIndicator and add popupId property for Indicator.
        return this._notify('finishPendingOperations', args, {bubbling: true}) as string;
    }

    protected _cancelFinishingPendingHandler(event: Event): string {
        const args = this._prepareEventArs(event, arguments);
        args[0] = args[0] || this._options.id;
        // catch showIndicator and add popupId property for Indicator.
        return this._notify('cancelFinishingPending', args, {bubbling: true}) as string;
    }

    private _prepareEventArs(event: Event, args: IArguments): unknown[] {
        event.stopPropagation();
        return Array.prototype.slice.call(args, 1);
    }

    protected _scrollHandler(): void {
        this._notify('pageScrolled', [this._options.id], {bubbling: true});
    }

    protected _controlResizeOuterHandler(): void {
        this._notify('popupResizeOuter', [this._options.id], {bubbling: true});

        // After updating popup position we will updating the position of the popups open with it.
        runDelayed(this._callOpenersUpdate.bind(this));
    }

    protected _controlResizeHandler(): void {
        // Children controls can notify events while parent control isn't mounted
        // Because children's afterMount happens before parent afterMount
        if (this._isPopupMounted) {
            this._notify('popupResizeInner', [this._options.id], {bubbling: true});
        }
    }

    /**
     * Proxy popup result
     * @function Controls/_popup/Manager/Popup#_sendResult
     */
    protected _sendResult(event: SyntheticEvent<Event>, ...args: any[]): void {
        const popupResultArgs = [this._options.id].concat(args);
        this._notify('popupResult', popupResultArgs, {bubbling: true});
    }

    /**
     * key up handler
     * @function Controls/_popup/Manager/Popup#_keyUp
     * @param event
     */
    protected _keyUp(event: SyntheticEvent<KeyboardEvent>): void {
        /**
         * Старая панель по событию keydown закрывается и блокирует всплытие события. Новая панель делает
         * то же самое, но по событию keyup. Из-за этого возникает следующая ошибка.
         * https://online.sbis.ru/opendoc.html?guid=0e4a5c02-f64c-4c7d-88b8-3ab200655c27
         *
         * Что бы не трогать старые окна, мы добавляем поведение на закрытие по esc. Закрываем только в том случае,
         * если новая панель поймала событие keydown клавиши esc.
         */
        if (this._isEscDown) {
            this._isEscDown = false;
            this._closeByESC(event);
        }
    }

    protected _keyDown(event: SyntheticEvent<KeyboardEvent>): void {
        if (event.nativeEvent.keyCode === constants.key.esc) {
            this._isEscDown = true;
        }
    }

    activatePopup(): void {
        // TODO Compatible
        if (this._options.autofocus && !this._options.isCompoundTemplate) {
            this.activate();
        }
    }

    getPopupId(): string {
        return this._options.id;
    }

    private _isResized(oldOptions: IPopupOptions, newOptions: IPopupOptions): boolean {
        const {position: oldPosition, hidden: oldHidden}: IPopupOptions = oldOptions;
        const {position: newPosition, hidden: newHidden}: IPopupOptions = newOptions;
        const hasWidthChanged: boolean = oldPosition.width !== newPosition.width;
        const hasHeightChanged: boolean = oldPosition.height !== newPosition.height;
        const hasMaxHeightChanged: boolean = oldPosition.maxHeight !== newPosition.maxHeight;
        const hasHiddenChanged: boolean = oldHidden !== newHidden;

        return hasWidthChanged || hasHeightChanged || hasMaxHeightChanged || (hasHiddenChanged && newHidden === false);
    }

    // TODO Compatible
    // Для совместимости новых окон и старого индикатора:
    // Чтобы событие клавиатуры в окне не стопилось, нужно правильно рассчитать индексы в методе getMaxZWindow WS.Core/core/WindowManager.js
    // В старых окнах есть метод getZIndex, а в новых нет. Поэтому, чтобы метод находил правильный максимальный z-index, добавляю геттер

    getZIndex(): number {
        return this._options.zIndex;
    }

    static getDefaultOptions(): IPopupControlOptions {
        return {
            content: PopupContent,
            autofocus: true
        };
    }
}

export default Popup;
