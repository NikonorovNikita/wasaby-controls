/**
 * Created by kraynovdo on 16.11.2017.
 */
import ItemsViewModel = require('Controls/_list/ItemsViewModel');
import entityLib = require('Types/entity');
import ItemsUtil = require('Controls/_list/resources/utils/ItemsUtil');
import cInstance = require('Core/core-instance');
import { Object as EventObject } from 'Env/Event';
import {isEqual} from 'Types/object';
import { IObservable } from 'Types/collection';
import { Model } from 'Types/entity';
import { CollectionItem, IEditingConfig, IItemActionsTemplateConfig, ISwipeConfig, ANIMATION_STATE } from 'Controls/display';
import { CssClassList } from "../Utils/CssClassList";
import {Logger} from 'UI/Utils';
import {detection} from 'Env/Env';
import {IItemAction} from 'Controls/itemActions';

const ITEMACTIONS_POSITION_CLASSES = {
    bottomRight: 'controls-itemActionsV_position_bottomRight',
    topRight: 'controls-itemActionsV_position_topRight'
};

/**
 *
 * @author Авраменко А.С.
 * @private
 */

var _private = {
    updateIndexes: function(self, startIndex, stopIndex) {
        self._startIndex = startIndex;
        self._stopIndex = stopIndex;
    },
    getItemPadding: function(cfg) {
        const itemPadding = cfg.itemPadding || {};
        const normalizeValue = (side) => (itemPadding[side] || 'default').toLowerCase();
        return {
            left: normalizeValue('left'),
            right: normalizeValue('right'),
            top: normalizeValue('top'),
            bottom: normalizeValue('bottom'),
        };
    },
    getSpacingClassList: function(cfg) {
        let classList = '';
        const itemPadding = _private.getItemPadding(cfg);
        const style = cfg.style || 'default';

        classList += ` controls-ListView__itemContent controls-ListView__itemContent_${style}`;
        classList += ` controls-ListView__item_${style}-topPadding_${itemPadding.top}_theme-${cfg.theme}`;
        classList += ` controls-ListView__item_${style}-bottomPadding_${itemPadding.bottom}_theme-${cfg.theme}`;
        classList += ` controls-ListView__item-rightPadding_${itemPadding.right}_theme-${cfg.theme}`;

        if (cfg.multiSelectVisibility !== 'hidden') {
            classList += ' controls-ListView__itemContent_withCheckboxes' + `_theme-${cfg.theme}`;
        } else {
            classList += ' controls-ListView__item-leftPadding_' + (itemPadding.left || 'default').toLowerCase() + `_theme-${cfg.theme}`;
        }

        return classList;
    },
    getItemByMarkedKey: function(self, markedKey) {
        if (markedKey === null) {
            return;
        }
        return self.getItemById(markedKey, self._options.keyProperty);
    },

    isMarked(self: {_markedKey: number | string}, current: {key: number | string}): boolean {
        const markedItem = _private.getItemByMarkedKey(self, self._markedKey);
        if (markedItem) {
            const item = markedItem.getContents ? markedItem.getContents() : markedItem;
            return item.getId ? item.getId() === current.key : false;
        }
        return false;
    },

    getMultiSelectClassList: function (current): string {
        let
            checkboxOnHover = current.multiSelectVisibility === 'onhover',
            isSelected = current.multiSelectStatus !== undefined;

        return CssClassList.add('js-controls-ListView__checkbox')
                           .add('js-controls-ListView__notEditable')
                           .add('controls-ListView__checkbox-onhover', checkboxOnHover && !isSelected)
                           .compile();
    },

    getGroupPaddingClasses(current, theme: string): { left: string; right: string } {
        const right = `controls-ListView__groupContent__rightPadding_${current.itemPadding.right}_theme-${theme}`;
        const left =  `controls-ListView__groupContent__leftPadding_${current.hasMultiSelect ? 'withCheckboxes' : current.itemPadding.left}_theme-${theme}`;
        return {right, left};
    },
    // itemActions classes only For Edge
    getItemActionsClasses(itemData, itemActionsPosition, actionMenuIsShown, theme): string {
        const th = `_theme-${theme}`;
        let classList = 'controls-itemActionsV' + ' controls-itemActionsV_full_item_size';
        classList += itemData.isActive() && actionMenuIsShown ? ' controls-itemActionsV_visible' : '';
        classList += itemData.isSwiped() ? ' controls-itemActionsV_swiped' : '';
        classList += itemData.itemActionsColumnScrollDraw ? ' controls-itemActionsV_columnScrollDraw' : '';
        return classList;
    },
    getItemActionsWrapperClasses(itemData, itemActionsPosition, highlightOnHover, style,
        itemActionsClass, itemPadding, toolbarVisibility, theme): string {
        const th = `_theme-${theme}`;
        let classList = 'controls-itemActionsV__wrapper';
        classList += '  controls-itemActionsV__wrapper_absolute';
        classList += itemData.isEditing() ? ` controls-itemActionsV_editing${th}` : '';
        classList += itemData.isEditing() && toolbarVisibility ? ' controls-itemActionsV_editingToolbarVisible' : '';
        classList += ` controls-itemActionsV_${itemActionsPosition}${th}`;
        classList += itemActionsPosition !== 'outside' ? itemActionsClass ? ' ' + itemActionsClass : ' controls-itemActionsV_position_bottomRight' : '';
        classList += highlightOnHover !== false ? ' controls-itemActionsV_style_' + (style ? style : 'default') + th : '';
        classList += _private.getItemActionsContainerPaddingClass(itemActionsClass, itemPadding, theme);
        return classList;
    },

    getItemActionsContainerPaddingClass(classes: string, itemPadding: {top?: string, bottom?: string}, theme: string): string {
        const _classes = classes || ITEMACTIONS_POSITION_CLASSES.bottomRight;
        const paddingClass: string[] = [];
        const themedPositionClassCompile = (position) => (
            `controls-itemActionsV_padding-${position}_${(itemPadding && itemPadding[position] === 'null' ? 'null' : 'default')}_theme-${theme}`
        );
        if (_classes.indexOf(ITEMACTIONS_POSITION_CLASSES.topRight) !== -1) {
            paddingClass.push(themedPositionClassCompile('top'));
        } else if (_classes.indexOf(ITEMACTIONS_POSITION_CLASSES.bottomRight) !== -1) {
            paddingClass.push(themedPositionClassCompile('bottom'));
        }
        return ` ${paddingClass.join(' ')} `;
    },

    // New Model compatibility
    addNewModelCompatibilityForItem(itemsModelCurrent: any): void {
        itemsModelCurrent.setActions = (actions: {showed: IItemAction[], all: IItemAction[]}, silent: boolean = true): void => {
            itemsModelCurrent.itemActions = actions;
            if (itemsModelCurrent.dispItem.setActions) {
                itemsModelCurrent.dispItem.setActions(actions, silent);
            }
        };
        itemsModelCurrent.getActions = (): {showed: IItemAction[], all: IItemAction[]} => (
            itemsModelCurrent.dispItem.getActions ? itemsModelCurrent.dispItem.getActions() : itemsModelCurrent.itemActions
        );
        itemsModelCurrent.setActive = (state: boolean): void => {
            itemsModelCurrent._isActive = state;
            if (itemsModelCurrent.dispItem.setActive !== undefined) {
                itemsModelCurrent.dispItem.setActive(state);
            }
        };
        itemsModelCurrent.isActive = (): boolean => (
            itemsModelCurrent.dispItem.isActive() !== undefined ? itemsModelCurrent.dispItem.isActive() : itemsModelCurrent._isActive
        );
        itemsModelCurrent.setSwiped = (state: boolean): void => {
            itemsModelCurrent._isSwiped = state;
            if (itemsModelCurrent.dispItem.setSwiped !== undefined) {
                itemsModelCurrent.dispItem.setSwiped(state);
            }
        };
        itemsModelCurrent.isSwiped = (): boolean => (
            itemsModelCurrent.dispItem.isSwiped !== undefined ? itemsModelCurrent.dispItem.isSwiped() : itemsModelCurrent._isSwiped
        );
        itemsModelCurrent.setEditing = (editing: boolean, editingContents?: Model, silent?: boolean): void => {
            itemsModelCurrent._isEditing = editing;
            if (itemsModelCurrent.dispItem.setEditing !== undefined) {
                itemsModelCurrent.dispItem.setEditing(editing, editingContents, silent);
            }
        };
        itemsModelCurrent.isEditing = (): boolean => (
            itemsModelCurrent.dispItem.isEditing !== undefined ? itemsModelCurrent.dispItem.isEditing() : itemsModelCurrent._isEditing
        );
        itemsModelCurrent.getContents = () => (
            itemsModelCurrent.dispItem.getContents ? itemsModelCurrent.dispItem.getContents() : null
        );
        itemsModelCurrent.hasVisibleActions = (): boolean => (
            itemsModelCurrent.dispItem.hasVisibleActions !== undefined ? itemsModelCurrent.dispItem.hasVisibleActions() : false
        );
        itemsModelCurrent.shouldDisplayActions = (): boolean => (
            itemsModelCurrent.dispItem.shouldDisplayActions !== undefined ? itemsModelCurrent.dispItem.shouldDisplayActions() : false
        );
        itemsModelCurrent.hasActionWithIcon = (): boolean => (
            itemsModelCurrent.dispItem.hasActionWithIcon !== undefined ? itemsModelCurrent.dispItem.hasActionWithIcon() : false
        );
        itemsModelCurrent.isSelected = (): boolean => (
            itemsModelCurrent.dispItem.isSelected !== undefined ? itemsModelCurrent.dispItem.isSelected() : itemsModelCurrent._isSelected
        );
        itemsModelCurrent.setSelected = (selected: boolean|null, silent?: boolean): void => {
            itemsModelCurrent._isSelected = true;
            if (itemsModelCurrent.dispItem.setSelected !== undefined) {
                itemsModelCurrent.dispItem.setSelected(selected, silent);
            }
        };
    }
};

const ListViewModel = ItemsViewModel.extend([entityLib.VersionableMixin], {
    _markedItem: null,
    _dragEntity: null,
    _draggingItemData: null,
    _dragTargetPosition: null,
    _actions: null,
    _actionsVersions: null,
    _selectedKeys: null,
    _markedKey: null,
    _hoveredItem: null,
    _reloadedKeys: null,
    _singleItemReloadCount: 0,
    _editingItemData: null,

    // New model compatibility
    _actionsAssigned: false,
    _actionsTemplateConfig: null,
    _swipeConfig: null,
    _actionsMenuConfig: null,
    _getActionsSwipeAnimation: null,
    // New model compatibility end

    constructor(cfg): void {
        const self = this;
        this._actions = {};
        this._actionsVersions = {};
        ListViewModel.superclass.constructor.apply(this, arguments);

        if (this._items && cfg.markerVisibility !== 'hidden') {
            if (cfg.markedKey !== null || cfg.markerVisibility === 'always' || cfg.markerVisibility === 'visible') {
                this._markedKey = cfg.markedKey;
                this.updateMarker(cfg.markedKey);
            }
        }

        this._selectedKeys = cfg.selectedKeys || [];

        // TODO надо ли?
        _private.updateIndexes(self, 0, self.getCount());

        this._reloadedKeys = {};
    },
    setItemPadding: function(itemPadding) {
        this._options.itemPadding = itemPadding;
        this._nextModelVersion();
    },
    getItemPadding: function() {
        return _private.getItemPadding(this._options);
    },
    getItemDataByItem: function() {
        const self = this;
        const itemsModelCurrent = ListViewModel.superclass.getItemDataByItem.apply(this, arguments);
        let dragItems;

        if (itemsModelCurrent._listViewModelCached) {
            return itemsModelCurrent;
        } else {
            itemsModelCurrent._listViewModelCached = true;
        }

        // New Model compatibility
        _private.addNewModelCompatibilityForItem(itemsModelCurrent);

        itemsModelCurrent.itemActions = {};
        itemsModelCurrent.itemActionsPosition = this._options.itemActionsPosition;
        itemsModelCurrent.actionsItem = this.getActionsItem(itemsModelCurrent.item);
        // TODO USE itemsModelCurrent.isSelected()
        itemsModelCurrent._isSelected = _private.isMarked(this, itemsModelCurrent);
        itemsModelCurrent._isActive = this._activeItem && itemsModelCurrent.dispItem.getContents() === this._activeItem.item;
        // TODO USE itemsModelCurrent.isSwiped()
        itemsModelCurrent._isSwiped = this._swipeItem && itemsModelCurrent.actionsItem === this._swipeItem.actionsItem;
        itemsModelCurrent.isRightSwiped = this._rightSwipedItem && itemsModelCurrent.dispItem.getContents() === this._rightSwipedItem.item;
        itemsModelCurrent.multiSelectStatus = this._selectedKeys[itemsModelCurrent.key];
        itemsModelCurrent.searchValue = this._options.searchValue;
        itemsModelCurrent.multiSelectVisibility = this._options.multiSelectVisibility;
        itemsModelCurrent.markerVisibility = this._options.markerVisibility;
        itemsModelCurrent.itemTemplateProperty = this._options.itemTemplateProperty;
        itemsModelCurrent.isSticky = itemsModelCurrent._isSelected && itemsModelCurrent.style === 'master';
        itemsModelCurrent.spacingClassList = _private.getSpacingClassList(this._options);
        itemsModelCurrent.itemPadding = _private.getItemPadding(this._options);
        itemsModelCurrent.hasMultiSelect = !!this._options.multiSelectVisibility && this._options.multiSelectVisibility !== 'hidden';
        itemsModelCurrent.multiSelectClassList = itemsModelCurrent.hasMultiSelect ? _private.getMultiSelectClassList(itemsModelCurrent) : '';
        itemsModelCurrent.showEditArrow = this._options.showEditArrow;
        itemsModelCurrent.calcCursorClasses = this._calcCursorClasses;
        itemsModelCurrent.backgroundStyle = this._options.backgroundStyle;
        itemsModelCurrent._isEditing = false;
        // Установка и сброс isEditing в новых списках уже вынесены в EditingController
        // itemsModelCurrent.setEditing(false, null, true);
        if (itemsModelCurrent.isGroup) {
            itemsModelCurrent.isStickyHeader = this._options.stickyHeader;
            itemsModelCurrent.virtualScrollConfig = Boolean(this._options.virtualScrollConfig);
        }

        itemsModelCurrent.shouldDrawMarker = (marker: boolean) => {
            const canDrawMarker = marker !== false && itemsModelCurrent.markerVisibility !== 'hidden' && !self._editingItemData;
            return canDrawMarker && _private.isMarked(self, itemsModelCurrent);
        };

        itemsModelCurrent.getMarkerClasses = (): string => {
            const style = this._options.style || 'default';
            return `controls-ListView__itemV_marker controls-ListView__itemV_marker_${style}_theme-${self._options.theme}`;
        };

        if (itemsModelCurrent.isGroup) {
            itemsModelCurrent.groupPaddingClasses = _private.getGroupPaddingClasses(itemsModelCurrent, self._options.theme);
        }

        // itemActionsClassesForEdge
        itemsModelCurrent.isIE12 = detection.isIE12;
        itemsModelCurrent.getItemActionsClasses = _private.getItemActionsClasses;
        itemsModelCurrent.getItemActionsWrapperClasses = _private.getItemActionsWrapperClasses;
        itemsModelCurrent.getContainerPaddingClass = _private.getItemActionsContainerPaddingClass;
        //
        // // Установка и сброс isEditing в новых списках уже вынесены в EditingController
        // if (this._editingItemData && itemsModelCurrent.key === this._editingItemData.key) {
        //     itemsModelCurrent.setEditing(true, itemsModelCurrent.getContents());
        //     itemsModelCurrent.item = this._editingItemData.item;
        // }

        if (this._dragEntity) {
            dragItems = this._dragEntity.getItems();
            if (dragItems[0] === itemsModelCurrent.key) {
                itemsModelCurrent.isDragging = true;
            }
            if (dragItems.indexOf(itemsModelCurrent.key) !== -1) {
                itemsModelCurrent.isVisible = dragItems[0] === itemsModelCurrent.key ? !this._dragTargetPosition : false;
            }
            if (this._draggingItemData && this._dragTargetPosition && this._dragTargetPosition.index === itemsModelCurrent.index) {
                itemsModelCurrent.dragTargetPosition = this._dragTargetPosition.position;
                itemsModelCurrent.draggingItemData = this._draggingItemData;
            }
        }

        // TODO Проверить. Это надо реализовать. Ошибки нет, т.к. в шаблонах щас есть проверка на эти методы
        // export const ITEMACTIONS_DISPLAY_MODE = {
        //     ICON: 'icon',
        //     TITLE: 'title',
        //     BOTH: 'both',
        //     AUTO: 'auto'
        // };
        // _needShowIcon(action: IItemAction): boolean {
        //     return !!action.icon && (action.displayMode !== ITEMACTIONS_DISPLAY_MODE.TITLE);
        // }
        // _needShowTitle(action: IItemAction): boolean {
        //     return !!action.title && (action.displayMode === ITEMACTIONS_DISPLAY_MODE.TITLE ||
        //         action.displayMode === ITEMACTIONS_DISPLAY_MODE.BOTH ||
        //         (action.displayMode === ITEMACTIONS_DISPLAY_MODE.AUTO ||
        //         !action.displayMode) && !action.icon);
        // }
        return itemsModelCurrent;
    },

    isShouldBeDrawnItem: function(item) {
        var isInRange = ListViewModel.superclass.isShouldBeDrawnItem.apply(this, arguments);
        return isInRange || (item.isGroup && item.isStickyHeader) || item.isSticky;
    },

    _calcCursorClasses: function(clickable, cursor) {
        const cursorStyle = cursor || (clickable === false ? 'default' : 'pointer');
        if (typeof clickable !== 'undefined') {
            Logger.warn('Controls/list:BaseItemTemplate', 'Option "clickable" is deprecated and will be removed in 20.3000. Use option "cursor" with value "default".');
        }
        return ` controls-ListView__itemV controls-ListView__itemV_cursor-${cursorStyle}`;
    },

    _calcItemVersion: function(item, key) {
        var version = ListViewModel.superclass._calcItemVersion.apply(this, arguments);

        if (this._dragEntity && this._dragEntity.getItems().indexOf(key) !== -1) {
            version = 'DRAG_ITEM_' + version;
        }

        if (this._dragTargetPosition && this._dragTargetPosition.item === item) {
            version = 'DRAG_POSITION_' + this._dragTargetPosition.position + '_' + version;
        }

        if (this._markedKey === key) {
            version = 'MARKED_' + version;
        }
        if (this._activeItem && this._activeItem.item === item) {
            version = 'ACTIVE_' + version;
        }
        if (this._selectedKeys && this._selectedKeys.hasOwnProperty(key)) {
            version = 'SELECTED_' + this._selectedKeys[key] + '_' + version;
        }
        if (this._reloadedKeys[key]) {
            version = `RELOADED_${this._reloadedKeys[key]}_` + version;
        }
        version = (this._editingItemData ? 'WITH_EDITING_' : 'WITHOUT_EDITING_') + version;
        if (this._editingItemData && this._editingItemData.key === key) {
            version = 'EDITING_' + version;
        }
        if (this._swipeItem && this._swipeItem.key === key) {
            version = 'SWIPE_' + version;
        }

        // TODO REMOVE OR IMPLEMENT (Not implemented in new lists)
        // if (this._actionsVersions.hasOwnProperty(key)) {
        //     version = 'ITEM_ACTION_' + this._actionsVersions[key] + version;
        // }

        return version;
    },

    setMarkedKey: function(key, byOptions) {
        if (byOptions) {
            this._options.markedKey = key;
        }
        if (key === this._markedKey) {
            return;
        }
        const changedItems = [
            this.getItemById(this._markedKey),
            this.getItemById(key)
        ];
        this._markedKey = key;
        this._savedMarkedKey = undefined;
        this._updateMarker(key);
        this._nextModelVersion(true, 'markedKeyChanged', '', changedItems);
        this._notify('onMarkedKeyChanged', this._markedKey);
    },

    _updateMarker: function(markedKey):void {
        this._markedKey = markedKey;
        if (this._options.markerVisibility === 'hidden' ||
            this._options.markerVisibility === 'onactivated' && this._markedKey === null) {
            return;
        }

        const isMarkedItemInRecordSet = _private.getItemByMarkedKey(this, markedKey);
        // If record with key equal markedKey not found in recordSet, set markedKey equal key first record in recordSet
        if (!isMarkedItemInRecordSet) {
            if (this.getCount()) {
                this._markedKey = this._items.at(0).getId();
            } else {
                this._markedKey = null;
            }
        }
    },

    updateMarker: function(markedKey):void {
        const curMarkedKey = this._markedKey;
        this._updateMarker(markedKey);
        if (curMarkedKey !== this._markedKey) {
            this._notify('onMarkedKeyChanged', this._markedKey);
            this._nextModelVersion(true);
        }
    },

    setMarkerVisibility: function(markerVisibility) {
        this._options.markerVisibility = markerVisibility;
        if (this._markedKey === null && markerVisibility === 'visible') {
            this.updateMarker(null);
        }
        this._nextModelVersion();
    },

    getFirstItem: function() {
        return ItemsUtil.getFirstItem(this._display);
    },
    getLastItem: function() {
        return ItemsUtil.getLastItem(this._display);
    },

    getIndexByKey(key: string | number) {
        return this._display.getIndexByKey(key);
    },

    getNextItemKey: function(key) {
        var
            itemIdx = this.getIndexByKey(key),
            nextItemId = itemIdx + 1,
            nextItem,
            itemsCount = this._display.getCount();
        while (nextItemId < itemsCount) {
            nextItem = this._display.at(nextItemId).getContents();
            if (cInstance.instanceOfModule(nextItem, 'Types/entity:Model')) {
                return this._display.at(nextItemId).getContents().getId();
            }
            nextItemId++;
        }
    },
    getPreviousItemKey: function(key) {
        var
            itemIdx = this.getIndexByKey(key),
            prevItemId = itemIdx - 1,
            prevItem;
        while (prevItemId >= 0) {
            prevItem = this._display.at(prevItemId).getContents();
            if (cInstance.instanceOfModule(prevItem, 'Types/entity:Model')) {
                return this._display.at(prevItemId).getContents().getId();
            }
            prevItemId--;
        }
    },
    getMarkedKey: function() {
        return this._markedKey;
    },
    getMarkedItem: function() {
        return _private.getItemByMarkedKey(this, this._markedKey);
    },
    getSelectionStatus: function(key) {
        return this._selectedKeys[key] !== undefined;
    },

    getSwipeItem: function() {
        return this._swipeItem.actionsItem;
    },

    getActiveItem: function() {
        return this._activeItem;
    },

    /**
     * TODO работа с activeItem Должна производиться через item.isActive(),
     *  но из-за того, как в TileView организована работа с isHovered, isScaled и isAnimated
     *  мы не можем снять эти состояния при клике внутри ItemActions
     * @param itemData
     */
    setActiveItem(item: CollectionItem<Model>): void {
        if (item === this._activeItem) {
            return;
        }
        const oldActiveItem = this.getActiveItem();
        if (oldActiveItem) {
            oldActiveItem.setActive(false);
        }
        // TODO костыль. В TileView вместо item передаётся объект, поэтому проверяем на function
        //  надо передавать настроенный item
        if (item && typeof item.setActive === 'function') {
            item.setActive(true);
        }
        this._activeItem = item;
        this._nextModelVersion(true, 'activeItemChanged');
    },

    setDragEntity: function(entity) {
        if (this._dragEntity !== entity) {
            this._dragEntity = entity;
            this._nextModelVersion(true);
        }
    },

    getDragEntity: function() {
        return this._dragEntity;
    },

    setDragItemData: function(itemData) {
        this._draggingItemData = itemData;
    },

    getDragItemData: function() {
        return this._draggingItemData;
    },

    calculateDragTargetPosition: function(targetData) {
        var
            position,
            prevIndex = -1;

        //If you hover on a record that is being dragged, then the position should not change.
        if (this._draggingItemData && this._draggingItemData.index === targetData.index) {
            return null;
        }

        if (this._dragTargetPosition) {
            prevIndex = this._dragTargetPosition.index;
        } else if (this._draggingItemData) {
            prevIndex = this._draggingItemData.index;
        }

        if (prevIndex === -1) {
            position = 'before';
        } else if (targetData.index > prevIndex) {
            position = 'after';
        } else if (targetData.index < prevIndex) {
            position = 'before';
        } else if (targetData.index === prevIndex) {
            position = this._dragTargetPosition.position === 'after' ? 'before' : 'after';
        }

        return {
            index: targetData.index,
            item: targetData.item,
            data: targetData,
            position: position
        };
    },

    setDragTargetPosition: function(position) {
        this._dragTargetPosition = position;
        this._nextModelVersion(true);
    },

    getDragTargetPosition: function() {
        return this._dragTargetPosition;
    },

    setSwipeItem: function(itemData) {
        if (!this._swipeItem || !itemData || itemData.item !== this._swipeItem.item) {
           this._swipeItem = itemData;
           this._nextModelVersion(true);
        }
    },

    /**
     * задаёт Для Item controls-ListView__item_rightSwipeAnimation
     * для решения https://online.sbis.ru/doc/e3866e50-5a3e-4403-a64e-0841db9cda9f
     * надо понять, надо это или нет.
     * Если надо, то реализовать в новой модели
     */
    setRightSwipedItem: function(itemData) {
        this._rightSwipedItem = itemData;
        this._nextModelVersion();
    },

    setHoveredItem: function(item){
        const changedItems = [];
        if (this._hoveredItem && typeof this._hoveredItem.getId === 'function') {
            changedItems.push(this.getItemById(this._hoveredItem.getId()));
        }
        if (item && typeof item.getId === 'function') {
            changedItems.push(this.getItemById(item.getId()));
        }

        this._hoveredItem = item;
        this._nextModelVersion(true, 'hoveredItemChanged', '', changedItems);
    },

    getHoveredItem: function () {
        return this._hoveredItem;
    },

    updateIndexes: function(startIndex, stopIndex) {
        if ((this._startIndex !== startIndex) || (this._stopIndex !== stopIndex)) {
            _private.updateIndexes(self, startIndex, stopIndex);
            this._nextModelVersion();
        }
    },

    getStartIndex: function() {
        return this._startIndex;
    },

    getStopIndex: function() {
        return this._stopIndex;
    },

    setItems: function(items) {
        var currentItems = this.getItems();

        ListViewModel.superclass.setItems.apply(this, arguments);

        //we should try to set markedKey by options, if there were no items before
        //this._markedKey setted in constructor only if items were in constructor config
        this.updateMarker(currentItems ? this._markedKey : this._options.markedKey);
        this._nextModelVersion();
    },

    _onBeginCollectionChange: function(action, newItems, newItemsIndex, removedItems, removedItemsIndex) {
        var
           self = this;
        if (action === IObservable.ACTION_REMOVE && removedItems && removedItems.length) {
            // TODO KINGO. При удалении элементов очищаем закешированные для них операции над записью. Тем самым:
            // а) избавляемся от утечек (не храним в памяти лишние ссылки);
            // б) при создании записи с таким же ID мы сгенерим для неё новые операции над записью, а не переиспользуем старые.
            // https://online.sbis.ru/opendoc.html?guid=905c3018-384a-4587-845c-aca5dc51944b
            removedItems.forEach(function(removedItem) {
                var
                   removedItemContents = removedItem.getContents();
                if (removedItemContents.get) {
                    delete self._actions[removedItemContents.get(self._options.keyProperty)];
                }
            });
        }
        _private.updateIndexes(this, 0, this.getCount());
        if (action === IObservable.ACTION_REMOVE && removedItems && removedItems.length) {
            const curenMarkerIndex = this.getIndexByKey(this._markedKey);
            const curentItem = _private.getItemByMarkedKey(this, this._markedKey);
            if (this._markedKey && curenMarkerIndex === -1 && !curentItem) {
                const prevValidItem = this.getPreviousItem(removedItemsIndex);
                const nextValidItem = this.getNextItem(removedItemsIndex);
                if (nextValidItem) {
                    this.updateMarker(nextValidItem);
                } else if (prevValidItem) {
                    this.updateMarker(prevValidItem);
                } else {
                    this.updateMarker(null);
                }
            }
        }
    },
    isValidItemForMarkedKey: function (item) {
        return !this._isGroup(item) && item.getId;
    },
    getPreviousItem: function (itemIndex) {
        var prevIndex = itemIndex - 1, prevItem;
        while (prevIndex >= 0) {
            prevItem = this._display.at(prevIndex).getContents();
            if (this.isValidItemForMarkedKey(prevItem)) {
                return prevItem.getId();
            }
            prevIndex--;
        }
    },
    getNextItem: function (itemIndex) {
        var nextIndex = itemIndex, nextItem, itemsCount = this._display.getCount();
        while (nextIndex < itemsCount) {
            nextItem = this._display.at(nextIndex).getContents();
            if (this.isValidItemForMarkedKey(nextItem)) {
                return nextItem.getId();
            }
            nextIndex++;
        }
    },
    setMarkerOnValidItem: function(index) {
        const prevValidItem = this.getPreviousItem(index);
        const nextValidItem = this.getNextItem(index);
        if (nextValidItem !== undefined) {
            this.setMarkedKey(nextValidItem);
        } else if (prevValidItem !== undefined) {
            this.setMarkedKey(prevValidItem);
        } else {
            this.setMarkedKey(null);
        }
    },
    _setEditingItemData: function(itemData) {
        const data = itemData ? itemData : this._editingItemData;
        this._editingItemData = itemData;
        this._onCollectionChange(
           new EventObject('oncollectionchange', this._display),
           IObservable.ACTION_CHANGE,
           [new CollectionItem({
              contents: data.item
           })],
           data.index,
           [],
           0
        );
        this._nextModelVersion(itemData === null);
    },

    getEditingItemData(): object | null {
        return this._editingItemData;
    },

    hasItemById: function(id, keyProperty) {
        return !!this.getItemById(id, keyProperty);
    },

    _prepareDisplayItemForAdd: function(item) {
        return ItemsUtil.getDefaultDisplayItem(this._display, item);
    },

    getActionsItem: function(item) {
      return item;
    },

    // New Model compatibility
    getItemBySourceKey(key: number | string): Model {
        return this.getItemById(key, this._options.keyProperty);
    },

    // New Model compatibility
    nextVersion(): void {
        this._nextVersion();
    },

    // New Model compatibility
    areActionsAssigned(): boolean {
        return this._actionsAssigned === true;
    },

    // New Model compatibility
    setActionsAssigned(assigned: boolean): void {
        this._actionsAssigned = assigned;
    },

    // Old method
    setEditingConfig(editingConfig: IEditingConfig): void {
        if (!isEqual(editingConfig, this._options.editingConfig)) {
            this._options.editingConfig = editingConfig;
            this._nextModelVersion();
        }
    },

    // New Model compatibility
    getEditingConfig(): IEditingConfig {
        return this._options.editingConfig;
    },

    // New Model compatibility
    getActionsTemplateConfig(): IItemActionsTemplateConfig {
        return this._actionsTemplateConfig;
    },

    // New Model compatibility
    setActionsTemplateConfig(config: IItemActionsTemplateConfig): void {
        if (!isEqual(this._actionsTemplateConfig, config)) {
            this._actionsTemplateConfig = config;
            this._nextVersion();
        }
    },

    // New Model compatibility
    getActionsMenuConfig(): any {
        return this._actionsMenuConfig;
    },

    // New Model compatibility
    setActionsMenuConfig(config: any): void {
        this._actionsMenuConfig = config;
    },

    // New Model compatibility
    setSwipeConfig(config: ISwipeConfig): void {
        if (!isEqual(this._swipeConfig, config)) {
            this._swipeConfig = config;
            this._nextVersion();
        }
    },

    // New Model compatibility
    getSwipeConfig(): ISwipeConfig {
        return this._swipeConfig;
    },

    // New Model compatibility
    setSwipeAnimation(animation: ANIMATION_STATE): void {
        this._getActionsSwipeAnimation = animation;
    },

    // New Model compatibility
    getSwipeAnimation(): ANIMATION_STATE {
        return this._getActionsSwipeAnimation;
    },

    updateSelection: function(selectedKeys) {
        this._selectedKeys = selectedKeys || [];
        this._nextModelVersion(true);
    },

    setSelectedItems(items: Model[], selected: boolean|null): void {
        // говнокод для совместимости с новой моделью
        // вместо false ставим undefined,
        // чтобы не сломалось показывание только при наведении
        items.forEach((item) => {
            if (selected === false) {
                this._selectedKeys[item.getId()] = undefined;
            } else {
                this._selectedKeys[item.getId()] = selected;
            }
        });

        this._display.setSelectedItems(items, selected);
    },

    getActiveItem: function() {
        return this._activeItem;
    },

    setItemTemplateProperty: function(itemTemplateProperty) {
        this._options.itemTemplateProperty = itemTemplateProperty;
        this._nextModelVersion();
    },

    setMultiSelectVisibility: function(multiSelectVisibility) {
        this._options.multiSelectVisibility = multiSelectVisibility;
        this._nextModelVersion(true);
    },

    getMultiSelectVisibility: function() {
        return this._options.multiSelectVisibility;
    },

    setSorting: function(sorting) {
        this._options.sorting = sorting;
    },

    getSorting: function() {
        return this._options.sorting;
    },

    setSearchValue: function(value) {
        this._options.searchValue = value;
    },

    __calcSelectedItem: function(display, selKey, keyProperty) {

        // TODO надо вычислить индекс
        /* if(!this._markedItem) {
         if (!this._selectedIndex) {
         this._selectedIndex = 0;//переводим на первый элемент
         }
         else {
         this._selectedIndex++;//условно ищем ближайший элемент, рядом с удаленным
         }
         this._markedItem = this._display.at(this._selectedIndex);
         } */
    },

    clearReloadedMarks: function() {
        this._reloadedKeys = {};
    },
    markItemReloaded: function(key) {
        this._reloadedKeys[key] = ++this._singleItemReloadCount;
    }
});

ListViewModel._private = _private;

export = ListViewModel;
