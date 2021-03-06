import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/EditInPlace/EditingOnMounting/EditingOnMounting';
import {Memory} from 'Types/source';
import {getFewCategories as getData} from '../../DemoHelpers/DataCatalog';
import {getActionsForContacts as getItemActions} from '../../DemoHelpers/ItemActionsCatalog';
import { IItemAction } from 'Controls/itemActions';

interface IEditCfg {
    toolbarVisibility: boolean;
    item: unknown;
    editOnClick: boolean;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _itemActions: IItemAction[] = getItemActions();
    private _viewSource: Memory;
    private _newData: unknown = getData().slice(0, 1);
    protected _editingConfig: IEditCfg = null;
    protected _beforeMount(): Promise<void> {
        this._newData[0].id = 1;

        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this._newData
        });
        return this._viewSource.read(1).then((res) => {
            this._editingConfig = {
                toolbarVisibility: true,
                item: res,
                editOnClick: true
            };
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
