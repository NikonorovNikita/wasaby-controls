/*  IHeaderCell
    Сделано:
    align Выравнивание содержимого ячейки по горизонтали.
    caption Текст заголовка ячейки.
    sortingProperty Свойство, по которому выполняется сортировка.
    template Шаблон заголовка ячейки.
    templateOptions Опции, передаваемые в шаблон ячейки заголовка.
    textOverflow Поведение текста, если он не умещается в ячейке
    valign Выравнивание содержимого ячейки по вертикали.

    Не сделано:
    isActionCell Поле, для определения ячейки действий
    startColumn Порядковый номер колонки, на которой начинается ячейка.
    startRow Порядковый номер строки, на которой начинается ячейка.
    endColumn Порядковый номер колонки, на которой заканчивается ячейка.
    endRow Порядковый номер строки, на которой заканчивается ячейка.
*/

import { TemplateFunction } from 'UI/Base';
import { IHeaderCell } from '../_grid/interface/IHeaderCell';
import GridHeader from './GridHeader';
import { mixin } from 'Types/_util/mixin';
import { OptionsToPropertyMixin } from 'Types/entity';

export interface IOptions<T> {
    owner: GridHeader<T>;
    headerCell: IHeaderCell;
}

export default class GridHeaderCell<T> extends mixin<OptionsToPropertyMixin>(OptionsToPropertyMixin) {
    protected _$owner: GridHeader<T>;
    protected _$headerCell: IHeaderCell;

    constructor(options?: IOptions<T>) {
        super();
        OptionsToPropertyMixin.call(this, options);
    }

    getHeaderCellIndex(): number {
        return this._$owner.getHeaderCellIndex(this);
    }

    isFirstColumn(): boolean {
        return this.getHeaderCellIndex() === 0;
    }

    isLastColumn(): boolean {
        return this.getHeaderCellIndex() === this._$owner.getHeaderCellsCount() - 1;
    }

    isMultiSelectColumn(): boolean {
        return this._$owner.getMultiSelectVisibility() !== 'hidden' && this.isFirstColumn();
    }

    getWrapperClasses(theme: string, style: string = 'default'): string {
        let wrapperClasses = `controls-Grid__header-cell controls-Grid__cell_${style}`;

        const isMultiHeader = false;
        const isStickySupport = false;

        wrapperClasses += ` controls-Grid__header-cell_theme-${theme}`;
        if (isMultiHeader) {
            wrapperClasses += ` controls-Grid__multi-header-cell_min-height_theme-${theme}`;
        } else {
            wrapperClasses += ` controls-Grid__header-cell_min-height_theme-${theme}`;
        }
        if (!isStickySupport) {
            wrapperClasses += ' controls-Grid__header-cell_static';
        }

        wrapperClasses += this._getWrapperPaddingClasses(theme, style);

        // _private.getBackgroundStyle(this._options, true);
        return wrapperClasses;
    }

    getWrapperStyles(): string {
        return '';
    }

    getContentClasses(theme: string): string {
        const isMultiHeader = false;
        let contentClasses = 'controls-Grid__header-cell__content';
        contentClasses += ` controls-Grid__header-cell__content_theme-${theme}`;
        if (isMultiHeader) {
            contentClasses += ` controls-Grid__row-multi-header__content_baseline_theme-${theme}`;
        } else {
            contentClasses += ` controls-Grid__row-header__content_baseline_theme-${theme}`;
        }
        return contentClasses;
    }

    getWrapperPaddingClasses(): string {
        let paddingClasses = '';
        return paddingClasses;
    }

    getTemplate(): TemplateFunction|string {
        return this._$headerCell.template;
    }

    getTemplateOptions(): {} {
        return this._$headerCell.templateOptions;
    }

    getCaption(): string {
        // todo "title" - is deprecated property, use "caption"
        return this._$headerCell.caption || this._$headerCell.title;
    }

    getSortingProperty(): string {
        return this._$headerCell.sortingProperty;
    }

    getAlign(): string {
        return this._$headerCell.align;
    }

    getVAlign(): string {
        return this._$headerCell.valign;
    }

    getTextOverflow(): string {
        return this._$headerCell.textOverflow;
    }

    // todo <<< START >>> compatible with old gridHeaderModel
    get column(): IHeaderCell {
        return this._$headerCell;
    }
    // todo <<< END >>>

    protected _getWrapperPaddingClasses(theme: string): string {
        let paddingClasses = '';
        const leftPadding = this._$owner.getLeftPadding();
        const rightPadding = this._$owner.getRightPadding();
        const isMultiSelectColumn = this.isMultiSelectColumn();
        const isFirstColumn = this.isFirstColumn();
        const isLastColumn = this.isLastColumn();

        // todo <<< START >>> need refactor css classes names
        const compatibleLeftPadding = leftPadding === 'default' ? '' : leftPadding;
        const compatibleRightPadding = rightPadding === 'default' ? '' : rightPadding;
        // todo <<< END >>>

        // left padding
        if (!isMultiSelectColumn) {
            if (isFirstColumn) {
                paddingClasses += ` controls-Grid__cell_spacingFirstCol_${leftPadding}_theme-${theme}`;
            } else {
                paddingClasses += ` controls-Grid__cell_spacingLeft${compatibleLeftPadding}_theme-${theme}`;
            }
        }

        // right padding
        if (isLastColumn) {
            paddingClasses += ` controls-Grid__cell_spacingLastCol_${rightPadding}_theme-${theme}`;
        } else {
            paddingClasses += ` controls-Grid__cell_spacingRight${compatibleRightPadding}_theme-${theme}`;
        }

        return paddingClasses;
    }
}

Object.assign(GridHeaderCell.prototype, {
    _moduleName: 'Controls/display:GridHeaderCell',
    _instancePrefix: 'grid-header-cell-',
    _$owner: null,
    _$headerCell: null
});
