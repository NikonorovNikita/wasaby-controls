import rk = require('i18n!Controls');
import {Control, TemplateFunction} from 'UI/Base';
import {TSelectedKeys} from 'Controls/interface';
import {default as IMenuControl, IMenuControlOptions} from 'Controls/_menu/interface/IMenuControl';
import {Sticky as StickyOpener} from 'Controls/popup';
import {Controller as SourceController} from 'Controls/source';
import {RecordSet, List} from 'Types/collection';
import {ICrudPlus, PrefetchProxy, QueryWhere} from 'Types/source';
import * as Clone from 'Core/core-clone';
import * as Merge from 'Core/core-merge';
import {Collection, Search, CollectionItem, SelectionController} from 'Controls/display';
import Deferred = require('Core/Deferred');
import ViewTemplate = require('wml!Controls/_menu/Control/Control');
import * as groupTemplate from 'wml!Controls/_menu/Render/groupTemplate';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Model} from 'Types/entity';
import {factory} from 'Types/chain';
import {isEqual} from 'Types/object';
import scheduleCallbackAfterRedraw from 'Controls/Utils/scheduleCallbackAfterRedraw';
import {view as constView} from 'Controls/Constants';
import {_scrollContext as ScrollData} from 'Controls/scroll';
import {TouchContextField} from 'Controls/context';
import {IItemAction, Controller as ItemActionsController} from 'Controls/itemActions';
import {error as dataSourceError} from 'Controls/dataSource';
import {ISelectorTemplate} from 'Controls/_interface/ISelectorDialog';
import {Stack} from 'Controls/popup/Stack';
import {TKey} from 'Controls/_menu/interface/IMenuControl';

/**
 * Контрол меню.
 * @class Controls/menu:Control
 * @public
 * @mixes Controls/_interface/IIconSize
 * @mixes Controls/_dropdown/interface/IDropdownSource
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/_menu/interface/IMenuControl
 * @demo Controls-demo/Menu/Control/Source/Index
 * @control
 * @category Popup
 * @author Герасимов А.М.
 */

interface IMenuPosition {
    left: number;
    top: number;
    height: number;
}

const SUB_DROPDOWN_DELAY = 400;

export default class MenuControl extends Control<IMenuControlOptions> implements IMenuControl {
    readonly '[Controls/_menu/interface/IMenuControl]': boolean = true;
    protected _template: TemplateFunction = ViewTemplate;

    _children: {
        Sticky: StickyOpener
    };

    protected _listModel: Collection<Model>;
    protected _moreButtonVisible: boolean = false;
    protected _expandButtonVisible: boolean = false;
    protected _applyButtonVisible: boolean = false;
    protected _closeButtonVisible: boolean = false;
    private _sourceController: typeof SourceController = null;
    private _subDropdownItem: CollectionItem<Model>|null;
    private _selectionChanged: boolean = false;
    private _expandedItems: RecordSet;
    private _itemsCount: number;
    private _openingTimer: number = null;
    private _closingTimer: number = null;
    private _isMouseInOpenedItemArea: boolean = false;
    private _expandedItemsFilter: Function;
    private _additionalFilter: Function;
    private _notifyResizeAfterRender: Boolean = false;
    private _itemActionsController: ItemActionsController;

    private _subMenu: HTMLElement;
    private _hoveredItem: CollectionItem<Model>;
    private _hoveredTarget: EventTarget;
    private _enterEvent: MouseEvent;
    private _subMenuPosition: IMenuPosition;
    private _openSubMenuEvent: MouseEvent;
    private _errorController: dataSourceError.Controller;
    private _errorConfig: dataSourceError.ViewConfig|void;
    private _popupId: string|null;

    protected _beforeMount(options: IMenuControlOptions,
                           context?: object,
                           receivedState?: void): Deferred<RecordSet> {
        this._expandedItemsFilter = this._expandedItemsFilterCheck.bind(this);
        this._additionalFilter = MenuControl._additionalFilterCheck.bind(this, options);

        this._closeButtonVisible = options.itemPadding.right === 'menu-close';

        if (options.source) {
            return this._loadItems(options);
        }
    }

    protected _beforeUpdate(newOptions: IMenuControlOptions): void {
        const rootChanged = newOptions.root !== this._options.root;
        const sourceChanged = newOptions.source !== this._options.source;
        const filterChanged = !isEqual(newOptions.filter, this._options.filter);
        let result;

        if (sourceChanged) {
            this._sourceController = null;
        }

        if (rootChanged || sourceChanged || filterChanged) {
            result = this._loadItems(newOptions).then(() => {
                this._notifyResizeAfterRender = true;
            });
        }
        if (this._isSelectedKeysChanged(newOptions.selectedKeys, this._options.selectedKeys)) {
            this._setSelectedItems(this._listModel, newOptions.selectedKeys);
        }

        return result;
    }

    protected _afterRender(oldOptions: IMenuControlOptions): void {
        if (this._notifyResizeAfterRender) {
            this._notify('controlResize', [], {bubbling: true});
        }
    }

    protected _beforeUnmount(): void {
        if (this._sourceController) {
            this._sourceController.cancelLoading();
            this._sourceController = null;
        }
        if (this._listModel) {
            this._listModel.destroy();
            this._listModel = null;
        }
        if (this._errorController) {
            this._errorController.destroy();
            this._errorController = null;
        }
    }

    protected _mouseEnterHandler(): void {
        if (this._container.closest('.controls-Menu__subMenu')) {
            this._notify('subMenuMouseenter');
        }
        this._updateItemActions(this._listModel, this._options);
    }

    protected _touchStartHandler(): void {
        this._updateItemActions(this._listModel, this._options);
    }

    protected _mouseLeaveHandler(event: SyntheticEvent<MouseEvent>): void {
        this._clearOpeningTimout();
        this._startClosingTimout();
    }

    protected _mouseMove(event: SyntheticEvent<MouseEvent>): void {
        if (this._isMouseInOpenedItemArea && this._subDropdownItem) {
            this._startOpeningTimeout();
        }
    }

    protected _itemMouseEnter(event: SyntheticEvent<MouseEvent>,
                              item: CollectionItem<Model>,
                              sourceEvent: SyntheticEvent<MouseEvent>): void {
        if (item.getContents() instanceof Model && !this._isTouch()) {
            this._clearClosingTimout();
            this._setItemParamsOnHandle(item, sourceEvent.target, sourceEvent.nativeEvent);

            this._checkOpenedMenu(sourceEvent.nativeEvent, item);
            this._startOpeningTimeout();
        }
    }

    protected _itemSwipe(e: SyntheticEvent<null>,
                         item: CollectionItem<Model>,
                         swipeEvent: SyntheticEvent<TouchEvent>,
                         swipeContainerHeight: number): void {
        const isSwipeLeft = swipeEvent.nativeEvent.direction === 'left';
        const itemKey = item.getContents().getKey();
        if (this._options.itemActions) {
            if (isSwipeLeft) {
                this._itemActionsController.activateSwipe(itemKey, swipeContainerHeight);
            } else {
                this._itemActionsController.deactivateSwipe();
            }
        } else {
            this._updateSwipeItem(item, isSwipeLeft);
        }
    }

    /**
     * Проверяет, обработать клик или открыть подменю. Подменю может быть многоуровневым
     * @param event
     * @param item
     * @param action
     * @param clickEvent
     * @private
     */
    protected _itemActionClick(event: SyntheticEvent<MouseEvent>,
                               item: CollectionItem<Model>,
                               action: IItemAction,
                               clickEvent: SyntheticEvent<MouseEvent>): void {
        const contents: Model = item.getContents();
        if (action && !action['parent@'] && action.handler) {
            action.handler(contents);
        }
    }

    protected _itemClick(event: SyntheticEvent<MouseEvent>,
                         item: Model,
                         sourceEvent: SyntheticEvent<MouseEvent>): void {
        if (item.get('readOnly')) {
            return;
        }
        const key: string | number = item.getKey();
        const treeItem: CollectionItem<Model> = this._listModel.getItemBySourceKey(key);

        if (MenuControl._isPinIcon(sourceEvent.target)) {
            this._pinClick(event, item);
        } else {
            if (this._options.multiSelect && this._selectionChanged && !this._isEmptyItem(treeItem.getContents())) {
                this._changeSelection(key, treeItem);
                this._updateApplyButton();

                this._notify('selectedKeysChanged', [this._getSelectedKeys()]);
            } else {
                if (this._isTouch() && item.get(this._options.nodeProperty) && this._subDropdownItem !== treeItem) {
                    this._handleCurrentItem(treeItem, sourceEvent.currentTarget, sourceEvent.nativeEvent);
                } else {
                    this._notify('itemClick', [item, sourceEvent]);
                }
            }
        }
    }

    private static _isPinIcon(target: EventTarget): boolean {
        return !!((target as HTMLElement)?.closest('.controls-Menu__iconPin'));
    }

    private _pinClick(event: SyntheticEvent<MouseEvent>, item: Model): void {
        this._notify('pinClick', [item]);
    }

    private _isTouch(): boolean {
        return this._context.isTouch.isTouch;
    }

    protected _checkBoxClick(event: SyntheticEvent<MouseEvent>): void {
        this._selectionChanged = true;
    }

    protected _applySelection(): void {
        this._notify('applyClick', [this._getSelectedItems()]);
    }

    protected _toggleExpanded(event: SyntheticEvent<MouseEvent>, value: boolean): void {
        if (value) {
            this._listModel.removeFilter(this._additionalFilter);
        } else {
            this._listModel.addFilter(this._additionalFilter);
        }
        // TODO after deleting additionalProperty option
        // if (value) {
        //     if (this._expandedItems) {
        //         this._listModel.removeFilter(this._expandedItemsFilter);
        //     } else {
        //         this._itemsCount = this._listModel.getCount();
        //         this._loadExpandedItems(this._options);
        //     }
        // } else {
        //     this._listModel.addFilter(this._expandedItemsFilter);
        // }
    }

    protected _changeIndicatorOverlay(event: SyntheticEvent<MouseEvent>, config: { overlay: string }): void {
        config.overlay = 'none';
    }

    protected _isEmptyItem(item: Model): boolean {
        return this._options.emptyText && item.getKey() === this._options.emptyKey;
    }

    protected _openSelectorDialog(): void {
        let selectedItems: List<Model>;
        // TODO: убрать по задаче: https://online.sbis.ru/opendoc.html?guid=637922a8-7d23-4d18-a7f2-b58c7cfb3cb0
        if (this._options.selectorOpenCallback) {
            selectedItems = this._options.selectorOpenCallback();
        } else {
            selectedItems = new List<Model>({
                items: <Model[]>this._getSelectedItems().filter((item: Model): boolean => {
                    return !this._isEmptyItem(item);
                })
            });
        }
        this._options.selectorOpener.openPopup(this._getSelectorDialogOptions(this._options, selectedItems)).then((popupId) => {
            this._popupId = popupId;
        });
        this._notify('moreButtonClick', [selectedItems]);
    }

    protected _subMenuResult(event: SyntheticEvent<MouseEvent>,
                             eventName: string,
                             eventResult: Model|HTMLElement,
                             nativeEvent: SyntheticEvent<MouseEvent>): void {
        if (eventName === 'menuOpened') {
            this._subMenu = eventResult as HTMLElement;
        } else if (eventName === 'subMenuMouseenter') {
            this._clearClosingTimout();
        } else {
            const notifyResult = this._notify(eventName, [eventResult, nativeEvent]);
            if (eventName === 'pinClick' || eventName === 'itemClick' && notifyResult !== false) {
                this._closeSubMenu();
            }
        }
    }

    protected _footerMouseEnter(event: SyntheticEvent<MouseEvent>): void {
        this._checkOpenedMenu(event.nativeEvent);
    }

    protected _separatorMouseEnter(event: SyntheticEvent<MouseEvent>, sourceEvent: SyntheticEvent<MouseEvent>): void {
        this._checkOpenedMenu(sourceEvent.nativeEvent);
    }

    private _checkOpenedMenu(nativeEvent: MouseEvent, newItem?: CollectionItem<Model>): void {
        const needCloseSubMenu: boolean = this._subMenu && this._subDropdownItem &&
            (!newItem || newItem !== this._subDropdownItem);
        if (!this._isNeedKeepMenuOpen(needCloseSubMenu, nativeEvent) && needCloseSubMenu) {
            this._closeSubMenu();
        }
    }

    private _isNeedKeepMenuOpen(needCloseDropDown: boolean, nativeEvent: MouseEvent): boolean {
        if (needCloseDropDown) {
            this._setSubMenuPosition();
            this._isMouseInOpenedItemArea = this._isMouseInOpenedItemAreaCheck(nativeEvent);
        } else {
            this._isMouseInOpenedItemArea = false;
        }
        return this._isMouseInOpenedItemArea;
    }

    private _closeSubMenu(needOpenDropDown: boolean = false): void {
        if (this._children.Sticky) {
            this._children.Sticky.close();
        }
        if (!needOpenDropDown) {
            this._subDropdownItem = null;
        }
    }

    private _setItemParamsOnHandle(item: CollectionItem<Model>,
                                  target: EventTarget,
                                  nativeEvent: MouseEvent): void {
        this._hoveredItem = item;
        this._hoveredTarget = target;
        this._enterEvent = nativeEvent;
    }

    private _setSubMenuPosition(): void {
        const clientRect: DOMRect = this._subMenu.getBoundingClientRect();
        this._subMenuPosition = {
            left: clientRect.left,
            top: clientRect.top,
            height: clientRect.height
        };

        if (this._subMenuPosition.left < this._openSubMenuEvent.clientX) {
            this._subMenuPosition.left += clientRect.width;
        }
    }

    private _handleCurrentItem(item: CollectionItem<Model>,
                              target: EventTarget,
                              nativeEvent: MouseEvent): void {
        const needOpenDropDown: boolean = item.getContents().get(this._options.nodeProperty) &&
            !item.getContents().get('readOnly');
        const needCloseDropDown: boolean = this._subMenu && this._subDropdownItem && this._subDropdownItem !== item;

        const needKeepMenuOpen: boolean = this._isNeedKeepMenuOpen(needCloseDropDown, nativeEvent);

        // Close the already opened sub menu. Installation of new data sets new size of the container.
        // If you change the size of the update, you will see the container twitch.
        this._checkOpenedMenu(nativeEvent, item);

        if (needOpenDropDown && !needKeepMenuOpen) {
            this._openSubMenuEvent = nativeEvent;
            this._subDropdownItem = item;
            this._openSubDropdown(target, item);
        }
    }

    private _clearClosingTimout(): void {
        clearTimeout(this._closingTimer);
    }

    private _startClosingTimout(): void {
        this._closingTimer = <any>setTimeout(this._closeSubMenu.bind(this), SUB_DROPDOWN_DELAY);
    }

    private _clearOpeningTimout(): void {
        clearTimeout(this._openingTimer);
    }

    private _handleItemTimeoutCallback(): void {
        this._isMouseInOpenedItemArea = false;
        if (this._hoveredItem !== this._subDropdownItem) {
            this._closeSubMenu();
        }
        this._handleCurrentItem(this._hoveredItem, this._hoveredTarget, this._enterEvent);
    }

    private _startOpeningTimeout(): void {
        this._clearOpeningTimout();
        this._openingTimer = <any>setTimeout((): void => {
            this._handleItemTimeoutCallback();
        }, SUB_DROPDOWN_DELAY);
    }

    private _isMouseInOpenedItemAreaCheck(curMouseEvent: MouseEvent): boolean {
        const firstSegment: number = MenuControl._calculatePointRelativePosition(this._openSubMenuEvent.clientX,
            this._subMenuPosition.left, this._openSubMenuEvent.clientY,
            this._subMenuPosition.top, curMouseEvent.clientX, curMouseEvent.clientY);

        const secondSegment: number = MenuControl._calculatePointRelativePosition(this._subMenuPosition.left,
            this._subMenuPosition.left, this._subMenuPosition.top, this._subMenuPosition.top +
            this._subMenuPosition.height, curMouseEvent.clientX, curMouseEvent.clientY);

        const thirdSegment: number = MenuControl._calculatePointRelativePosition(this._subMenuPosition.left,
            this._openSubMenuEvent.clientX,this._subMenuPosition.top +
            this._subMenuPosition.height, this._openSubMenuEvent.clientY, curMouseEvent.clientX, curMouseEvent.clientY);

        return MenuControl._getSign(firstSegment) === MenuControl._getSign(secondSegment) &&
            MenuControl._getSign(firstSegment) === MenuControl._getSign(thirdSegment);
    }

    // FIXME https://online.sbis.ru/opendoc.html?guid=923f813d-7ed2-4e7d-94d8-65b0b733a4bd
    private static _getSign(x: number): number {
        x = +x;
        if (x === 0 || isNaN(x)) {
            return x;
        }
        return x > 0 ? 1 : -1;
    }

    private static _calculatePointRelativePosition(firstSegmentPointX: number,
                                           secondSegmentPointX: number,
                                           firstSegmentPointY: number,
                                           secondSegmentPointY: number,
                                           curPointX: number,
                                           curPointY: number): number {
        return (firstSegmentPointX - curPointX) * (secondSegmentPointY - firstSegmentPointY) -
            (secondSegmentPointX - firstSegmentPointX) * (firstSegmentPointY - curPointY);
    }

    private _getSelectorDialogOptions(options: IMenuControlOptions, selectedItems: List<Model>): object {
        const selectorTemplate: ISelectorTemplate = options.selectorTemplate;
        const selectorDialogResult: Function = options.selectorDialogResult;
        const selectorOpener: Stack = options.selectorOpener;

        const templateConfig: object = {
            selectedItems,
            handlers: {
                onSelectComplete: (event, result) => {
                    selectorDialogResult(event, result);
                    selectorOpener.close();
                }
            }
        };
        Merge(templateConfig, selectorTemplate.templateOptions);

        return Merge({
            opener: this,
            templateOptions: templateConfig,
            template: selectorTemplate.templateName,
            isCompoundTemplate: options.isCompoundTemplate,
            eventHandlers: {
                onResult: (result, event) => {
                    selectorDialogResult(event, result);
                    selectorOpener.closePopup(this._popupId);
                }
            }
        }, selectorTemplate.popupOptions || {});
    }

    private _changeSelection(key: string|number|null, treeItem: CollectionItem<Model>): void {
        MenuControl._selectItem(this._listModel, key, !treeItem.isSelected());

        const isEmptySelected: boolean = this._options.emptyText && !this._listModel.getSelectedItems().length;
        MenuControl._selectItem(this._listModel, this._options.emptyKey, !!isEmptySelected );
    }

    private _getSelectedKeys(): TSelectedKeys {
        const selectedKeys: TSelectedKeys = [];
        factory(this._listModel.getSelectedItems()).each((treeItem): void => {
            selectedKeys.push(treeItem.getContents().get(this._options.keyProperty));
        });
        return selectedKeys;
    }

    private _getSelectedItems(): object[] {
        return factory(this._listModel.getSelectedItems()).map(
            (item: CollectionItem<Model>): Model => item.getContents()
        ).reverse().value();
    }

    private _getSelectedItemsByKeys(listModel: Collection<Model>, selectedKeys: TSelectedKeys): Model[] {
        const items = [];
        factory(selectedKeys).each((key) => {
            if (listModel.getItemBySourceKey(key)) {
                items.push(listModel.getItemBySourceKey(key).getContents());
            }
        });
        return items;
    }

    private _expandedItemsFilterCheck(item: CollectionItem<Model>, index: number): boolean {
        return index <= this._itemsCount;
    }

    private _isSelectedKeysChanged(newKeys: TSelectedKeys, oldKeys: TSelectedKeys): boolean {
        const diffKeys: TSelectedKeys = factory(newKeys).filter((key) => !oldKeys.includes(key)).value();
        return newKeys.length !== oldKeys.length || !!diffKeys.length;
    }

    private _updateApplyButton(): void {
        const isApplyButtonVisible: boolean = this._applyButtonVisible;
        const newSelectedKeys: TSelectedKeys = factory(this._listModel.getSelectedItems()).map(item => {
            return item.getContents().get(this._options.keyProperty);
        }).value();
        this._applyButtonVisible = this._isSelectedKeysChanged(newSelectedKeys, this._options.selectedKeys);

        if (this._applyButtonVisible !== isApplyButtonVisible) {
            scheduleCallbackAfterRedraw(this, (): void => {
                this._notify('controlResize', [], {bubbling: true});
            });
        }
    }

    private _updateSwipeItem(newSwipedItem: CollectionItem<Model>, isSwipeLeft: boolean): void {
        const oldSwipedItem: CollectionItem<Model> = this._listModel.find(
            (item: CollectionItem<Model>): boolean => item.isSwiped() || item.isRightSwiped());
        if (isSwipeLeft && oldSwipedItem) {
            oldSwipedItem.setSwiped(false);
        }

        newSwipedItem.setSwiped(isSwipeLeft);
        this._listModel.nextVersion();
    }

    private _createViewModel(items: RecordSet, options: IMenuControlOptions): void {
        this._listModel = this._getCollection(items, options);
        this._setSelectedItems(this._listModel, options.selectedKeys);
    }

    private _getCollection(items: RecordSet<Model>, options: IMenuControlOptions): Collection<Model> {
        const collectionConfig: object = {
            collection: items,
            keyProperty: options.keyProperty,
            unique: true
        };
        let listModel: Search<Model> | Collection<Model>;

        if (options.searchParam && options.searchValue) {
            listModel = new Search({...collectionConfig,
                nodeProperty: options.nodeProperty,
                parentProperty: options.parentProperty,
                root: options.root
            });
        } else {
            // В дереве не работает группировка,
            // ждем решения по ошибке https://online.sbis.ru/opendoc.html?guid=f4a3be79-5ec5-45d2-b742-2d585c5c069d
            listModel = new Collection({...collectionConfig,
                filter: MenuControl._displayFilter.bind(this, options)
            });
        }

        if (options.itemActions) {
            this._updateItemActions(listModel, options);
        }

        if (options.groupProperty) {
            listModel.setGroup(this._groupMethod.bind(this, options));
        } else if (options.groupingKeyCallback) {
            listModel.setGroup(options.groupingKeyCallback);
        }
        if (options.additionalProperty) {
            listModel.addFilter(this._additionalFilter);
        }
        return listModel;
    }

    private static _isHistoryItem(item: Model): boolean {
        return !!(item.get('pinned') || item.get('recent') || item.get('frequent'));
    }

    private static _additionalFilterCheck(options: IMenuControlOptions, item: Model): boolean {
        return (!item.get || !item.get(options.additionalProperty) || MenuControl._isHistoryItem(item));
    }

    private static _displayFilter(options: IMenuControlOptions, item: Model): boolean {
        let isVisible: boolean = true;
        if (item && item.get && options.parentProperty && options.nodeProperty) {
            let parent: TKey = item.get(options.parentProperty);
            if (parent === undefined) {
                parent = null;
            }
            isVisible = parent === options.root;
        }
        return isVisible;
    }

    private _groupMethod(options: IMenuControlOptions, item: Model): string {
        const groupId: string = item.get(options.groupProperty);
        const isHistoryItem: boolean = MenuControl._isHistoryItem(item) && this._options.root === null;
        return groupId !== undefined && !isHistoryItem ? groupId : constView.hiddenGroup;
    }

    private _setSelectedItems(listModel: Collection<Model>, keys: TSelectedKeys): void {
        listModel.setSelectedItems(this._getSelectedItemsByKeys(listModel, keys), true);
    }

    private _getSourceController(
        {source, navigation, keyProperty}: IMenuControlOptions): typeof SourceController {
        if (!this._sourceController) {
            this._sourceController = new SourceController({
                source,
                navigation,
                keyProperty
            });
        }
        return this._sourceController;
    }

    private _loadExpandedItems(options: IMenuControlOptions): void {
        const loadConfig: IMenuControlOptions = Clone(options);

        delete loadConfig.navigation;
        this._sourceController = null;

        this._loadItems(loadConfig).addCallback((items: RecordSet): void => {
            this._expandedItems = items;
            this._createViewModel(items, options);
        });
    }

    private _loadItems(options: IMenuControlOptions): Deferred<RecordSet> {
        const filter: QueryWhere = Clone(options.filter) || {};
        filter[options.parentProperty] = options.root;

        return this._getSourceController(options).load(filter).then(
            (items: RecordSet): RecordSet => {
                if (options.dataLoadCallback) {
                    options.dataLoadCallback(items);
                }
                this._createViewModel(items, options);
                this._moreButtonVisible = options.selectorTemplate &&
                    this._getSourceController(options).hasMoreData('down');
                this._expandButtonVisible = this._isExpandButtonVisible(items, options.additionalProperty, options.root);

                return items;
            },
            (error: Error): Promise<void | dataSourceError.ViewConfig> => this._processError(error)
        );
    }

    private _isExpandButtonVisible(items: RecordSet,
                                   additionalProperty: string,
                                   root: string|number|null): boolean {
        let hasAdditional: boolean = false;

        if (additionalProperty && root === null) {
            items.each((item: Model): void => {
                if (!hasAdditional) {
                    hasAdditional = item.get(additionalProperty) && !MenuControl._isHistoryItem(item);
                }
            });
        }
        return hasAdditional;
    }

    private _openSubDropdown(target: EventTarget, item: CollectionItem<Model>): void {
        // openSubDropdown is called by debounce and a function call can occur when the control is destroyed,
        // just check _children to make sure, that the control isn't destroyed
        if (item && this._children.Sticky && this._subDropdownItem) {
            const popupOptions: object = this._getPopupOptions(target, item);
            this._notify('beforeSubMenuOpen', [popupOptions]);
            this._children.Sticky.open(popupOptions).then();
        }
    }

    private _getPopupOptions(target: EventTarget, item: CollectionItem<Model>): object {
        return {
            templateOptions: this._getTemplateOptions(item),
            target,
            autofocus: false,
            direction: {
                horizontal: 'right'
            },
            targetPoint: {
                horizontal: 'right'
            }
        };
    }

    private _getTemplateOptions(item: CollectionItem<Model>): object {
        const root: TKey = item.getContents().get(this._options.keyProperty);
        const subMenuOptions: object = {
            root,
            bodyContentTemplate: 'Controls/_menu/Control',
            footerContentTemplate: this._options.nodeFooterTemplate,
            footerItemData: {
                key: root,
                item
            },
            closeButtonVisibility: false,
            showClose: false,
            showHeader: false,
            headerTemplate: null,
            headerContentTemplate: null,
            additionalProperty: null,
            searchParam: null,
            itemPadding: null,
            source: this._getSourceSubMenu(root),
            iWantBeWS3: false // FIXME https://online.sbis.ru/opendoc.html?guid=9bd2e071-8306-4808-93a7-0e59829a317a
        };

        return {...this._options, ...subMenuOptions};
    }

    private _getSourceSubMenu(root: TKey): ICrudPlus {
        let source: ICrudPlus = this._options.source;
        const collection =  this._listModel.getCollection() as any as RecordSet<Model>;
        if (collection.getIndexByValue(this._options.parentProperty, root) !== -1) {
            source = new PrefetchProxy({
                target: this._options.source,
                data: {
                    query: collection
                }
            });
        }
        return source;
    }

    private _updateItemActions(listModel: Collection<Model>, options: IMenuControlOptions): void {
        const itemActions: IItemAction[] = options.itemActions;

        if (!itemActions) {
            return;
        }

        if (!this._itemActionsController) {
            this._itemActionsController = new ItemActionsController();
        }
        const editingConfig = listModel.getEditingConfig();
        this._itemActionsController.update({
            collection: listModel,
            itemActions,
            itemActionsPosition: 'inside',
            visibilityCallback: options.itemActionVisibilityCallback,
            style: 'default',
            theme: options.theme,
            actionAlignment: 'horizontal',
            actionCaptionPosition: 'none',
            itemActionsClass: `controls-Menu__itemActions_position_rightCenter_theme-${options.theme}`,
            iconSize: editingConfig ? 's' : 'm'
        });
    }

    private _getChildContext(): object {
        return {
            ScrollData: new ScrollData({pagingVisible: false})
        };
    }

    private static _selectItem(collection: Collection<Model>, key: number|string, state: boolean): void {
        const item: CollectionItem<Model> = collection.getItemBySourceKey(key);
        if (item) {
            item.setSelected(state, true);
            collection.nextVersion();
        }
    }

    private _processError(error: Error): Promise<dataSourceError.ViewConfig|void> {
        return this._getErrorController().process({
            error,
            theme: this._options.theme,
            mode: dataSourceError.Mode.include
        }).then((errorConfig: dataSourceError.ViewConfig|void): dataSourceError.ViewConfig|void => {
            if (errorConfig) {
                errorConfig.options.size = 'medium';
            }
            this._showError(errorConfig);
            return errorConfig;
        });
    }

    private _showError(error: dataSourceError.ViewConfig|void): void {
        this._errorConfig = error;
    }

    private _getErrorController(): dataSourceError.Controller {
        if (!this._errorController) {
            this._errorController = new dataSourceError.Controller({});
        }
        return this._errorController;
    }

    static _theme: string[] = ['Controls/menu'];

    static getDefaultOptions(): object {
        return {
            selectedKeys: [],
            root: null,
            emptyKey: null,
            moreButtonCaption: rk('Еще') + '...',
            groupTemplate,
            itemPadding: {}
        };
    }

    static contextTypes(): object {
        return {
            isTouch: TouchContextField
        };
    }
}
