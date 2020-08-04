import {Control, IControlOptions} from 'UI/Base';
import {constants} from 'Env/Env';
import {SyntheticEvent} from 'Vdom/Vdom';
import IDropdownController from 'Controls/_dropdown/interface/IDropdownController';
import {RegisterUtil, UnregisterUtil} from 'Controls/event';
import {DependencyTimer} from 'Controls/Utils/FastOpen';
import {RecordSet} from 'Types/collection';

export type DropdownReceivedState = {items?: RecordSet, history?: RecordSet};

export class BaseDropdown extends Control<IControlOptions, DropdownReceivedState> {
    protected _controller: IDropdownController = null;
    protected _isOpened: boolean = false;
    protected _dependenciesTimer: DependencyTimer = null;

    reload(): void {
        this._controller.reload();
    }

    closeMenu(): void {
        this._controller.closeMenu();
    }

    protected _afterMount(options?: IControlOptions, contexts?: any): void {
        RegisterUtil(this, 'scroll', this._handleScroll.bind(this));
    }

    protected _handleKeyDown(event): void {
        if (event.nativeEvent.keyCode === constants.key.esc && this._isOpened) {
            this._controller.closeMenu();
            event.stopPropagation();
        }
    }

    protected _handleClick(event: SyntheticEvent): void {
        // stop bubbling event, so the list does not handle click event.
        event.stopPropagation();
    }

    protected _handleMouseEnter(event: SyntheticEvent): void {
        if (!this._options.readOnly) {
            if (!this._dependenciesTimer) {
                this._dependenciesTimer = new DependencyTimer();
            }
            this._dependenciesTimer.start(this._controller.loadDependencies.bind(this._controller));
        }
    }

    protected _handleMouseLeave(event: SyntheticEvent): void {
        this._dependenciesTimer?.stop();
    }

    protected _onOpen(): void {
        this._isOpened = true;
        this._notify('dropDownOpen');
    }

    protected _onClose(): void {
        this._isOpened = false;
        this._controller.handleClose();
        this._notify('dropDownClose');
    }

    protected _footerClick(data): void {
        this._notify('footerClick', [data]);
        if (!this._$active) {
            this._controller.closeMenu();
        }
    }

    protected _selectorDialogOpened(data): void {
        this._initSelectorItems = data;
        this._controller.closeMenu();
    }

    protected _handleScroll(): void {
        if (this._isOpened) {
            this._controller.closeMenu();
        }
    }

    protected _beforeUnmount(): void {
        UnregisterUtil(this, 'scroll');
        this._controller.destroy();
    }
}