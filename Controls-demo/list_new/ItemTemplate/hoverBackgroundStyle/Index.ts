import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/ItemTemplate/hoverBackgroundStyle/hoverBackgroundStyle';
import {Memory} from 'Types/source';
import {getFewCategories as getData} from '../../DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/List_new/ItemTemplate/hoverBackgroundStyle/hoverBackgroundStyle'];
}