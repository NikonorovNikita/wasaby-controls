import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/list_new/Marker/AddItem/AddItem"
import {Memory} from "Types/source"
import {getFewCategories as getData} from "../../DemoHelpers/DataCatalog"

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _fakeItemId: number = 0;

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        })
    }

    private _beginAdd(): void {
        let item = {
            id: ++this._fakeItemId,
            title: ''
        };
        this._children.list.beginAdd({item});
    }
}