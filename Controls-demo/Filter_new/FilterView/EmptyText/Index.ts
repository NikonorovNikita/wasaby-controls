import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Filter_new/FilterView/EmptyText/EmptyText';
import 'Controls-demo/Filter_new/resources/HistorySourceDemo';
import {getItems} from 'Controls-demo/Filter_new/resources/FilterItemsStorage';
import {SyntheticEvent} from 'Vdom/Vdom';
import {object} from 'Types/util';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _source: unknown[] = [];

    protected _beforeMount(): void {
        this._source = getItems();
    }

    protected _itemsChangedHandler(event: SyntheticEvent, items: unknown[]): void {
        this._source = object.clone(items);
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Filter_new/Filter'];
}
