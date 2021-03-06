import Collection, { ItemsFactory, IOptions as IBaseOptions } from './Collection';
import GridCollectionItem, { IOptions as IGridCollectionItemOptions } from './GridCollectionItem';
import { TemplateFunction } from 'UI/Base';
import { TColumns } from '../_grid/interface/IColumn';
import { THeader } from '../_grid/interface/IHeaderCell';
import GridHeader from './GridHeader';
import GridResults from './GridResults';
import GridFooter from './GridFooter';
/* todo заготовка для ladder
import { stickyLadderCellsCount, prepareLadder,  isSupportLadder, getStickyColumn } from '../_grid/utils/GridLadderUtil';*/

type TResultsPosition = 'top' | 'bottom';

export interface IOptions<
    S,
    T extends GridCollectionItem<S> = GridCollectionItem<S>
> extends IBaseOptions<S, T> {
    columns: TColumns;
    footerTemplate: TemplateFunction;
    header: THeader;
    resultsTemplate: TemplateFunction;
    resultsPosition: TResultsPosition;
    headerInEmptyListVisible: boolean;
    /* todo заготовка для ladder
    ladderProperties: string[];*/
}

export default class GridCollection<
    S,
    T extends GridCollectionItem<S> = GridCollectionItem<S>
> extends Collection<S, T> {
    protected _$columns: TColumns;
    protected _$header: GridHeader<S>;
    protected _$footer: GridFooter<S>;
    protected _$results: GridResults<S>;
    /* todo заготовка для ladder
    protected _$ladder: {}; */
    protected _$resultsPosition: TResultsPosition;
    protected _$headerInEmptyListVisible: boolean;

    constructor(options: IOptions<S, T>) {
        super(options);
        this._$headerInEmptyListVisible = options.headerInEmptyListVisible;
        this._$resultsPosition = options.resultsPosition;

        if (this._headerIsVisible(options)) {
            this._$header = this._initializeHeader(options);
        }
        if (options.footerTemplate) {
            this._$footer = this._initializeFooter(options);
        }
        if (this._resultsIsVisible()) {
            this._$results = this._initializeResults(options);
        }
        /* todo заготовка для ladder
        if (isSupportLadder(options.ladderProperties)) {
            this._$ladder = this._initializeLadder(options);
        }*/
    }

    getColumns(): TColumns {
        return this._$columns;
    }

    getHeader(): GridHeader<S> {
        return this._$header;
    }

    getFooter(): GridFooter<S> {
        return this._$footer;
    }

    getResults(): GridResults<S> {
        return this._$results;
    }

    getResultsPosition(): TResultsPosition {
        return this._$resultsPosition;
    }

    /*  todo заготовка для ladder
    protected _initializeLadder(options: IOptions<S>): {} {
        return prepareLadder({
            columns: options.columns,
            ladderProperties: options.ladderProperties,
            startIndex: this.getStartIndex(),
            stopIndex: this.getStopIndex(),
            display: this
        });
    }*/

    getEmptyTemplateClasses(theme?: string): string {
        const rowSeparatorSize = this.getRowSeparatorSize();
        let emptyTemplateClasses = `controls-GridView__emptyTemplate js-controls-GridView__emptyTemplate`;
        emptyTemplateClasses += ` controls-Grid__row-cell_withRowSeparator_size-${rowSeparatorSize}`;
        emptyTemplateClasses += ` controls-Grid__row-cell_withRowSeparator_size-${rowSeparatorSize}_theme-${theme}`;
        return emptyTemplateClasses;
    }

    protected _headerIsVisible(options: IOptions<S>): boolean {
        const hasHeader = options.header && options.header.length;
        return hasHeader && (this._$headerInEmptyListVisible || this.getCollectionCount() > 0);
    }

    protected _resultsIsVisible(): boolean {
        const hasResultsPosition = !!this._$resultsPosition;
        const hasMoreData = this.getHasMoreData();
        return hasResultsPosition && (hasMoreData || this.getCollectionCount() > 1);
    }

    protected _initializeHeader(options: IOptions<S>): GridHeader<S> {
        return new GridHeader({
            owner: this,
            header: options.header
        });
    }

    protected _initializeFooter(options: IOptions<S>): GridFooter<S> {
        return new GridFooter({
            owner: this,
            footerTemplate: options.footerTemplate
        });
    }

    protected _initializeResults(options: IOptions<S>): GridResults<S> {
        return new GridResults({
            owner: this,
            results: this.getMetaResults(),
            resultsTemplate: options.resultsTemplate
        });
    }

    protected _getItemsFactory(): ItemsFactory<T> {
        const superFactory = super._getItemsFactory();
        return function CollectionItemsFactory(options?: IGridCollectionItemOptions<S>): T {
            /* todo заготовка для ladder
            options.ladder = this._$ladder;
             */
            options.columns = this._$columns;
            return superFactory.call(this, options);
        };
    }
}

Object.assign(GridCollection.prototype, {
    '[Controls/_display/GridCollection]': true,
    _moduleName: 'Controls/display:GridCollection',
    _itemModule: 'Controls/display:GridCollectionItem',
    _$columns: null,
    _$headerInEmptyListVisible: false,
    _$resultsPosition: null
});
