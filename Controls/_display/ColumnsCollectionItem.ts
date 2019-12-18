import CollectionItem from './CollectionItem';
import { register } from 'Types/di';
import { ColumnsCollection } from '../display';
import {IOptions as IBaseOptions} from './CollectionItem';

export interface IOptions<T> extends IBaseOptions<T> {
    column: number;
}

export default class ColumnsCollectionItem<T> extends CollectionItem<T> {
    protected _$column: number;
    protected _$owner: ColumnsCollection<T>;
    constructor(options: IOptions<T>) {
        super(options);
        this._$column = options.column;
    }
    getColumn(): number {
        return this._$column;
    }
    getWrapperClasses(templateHighlightOnHover: boolean = true, marker: boolean = true): string {
        let result: string = super.getWrapperClasses.apply(this, arguments);
        result += ' controls-ColumnsView__itemV';
        if (marker && this.isMarked()) {
            result += ' controls-ColumnsView__item_marked';
        }
        return result;
    }
    getContentClasses(): string {
        let classes: string = ' controls-ColumnsView__itemContent';
        if (this._$owner.getMultiSelectVisibility() !== 'hidden') {
            classes += ' controls-ListView__itemContent_withCheckboxes';
        }
        return classes;
    }

}

Object.assign(ColumnsCollectionItem.prototype, {
    '[Controls/_display/ColumnsCollectionItem]': true,
    _moduleName: 'Controls/display:ColumnsCollectionItem',
    _instancePrefix: 'columns-item-',
    _$column: 1
});

register('Controls/display:ColumnsCollectionItem', ColumnsCollectionItem, {instantiate: false});
