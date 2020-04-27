import Control = require('Core/Control')
import template = require('wml!Controls-demo/List/VirtualScroll/resources/BaseTemplate')
import {Memory} from 'Types/source'
import {createItems} from './resources/Data'



class EqualPages extends Control {
    [x: string]: any;
    protected _template: Function = template;
    private _listName: string = 'myList';
    protected _viewSource: Memory;
    private _itemsCount: number = 1000;
    protected _virtualPageSize: number = 40;
    protected _navigation = {
        source: 'page',
        view: 'infinity',
        sourceConfig: {
            pageSize: 40,
            page: 0,
            hasMore: false
        }
    };

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: createItems(this._itemsCount)
        });
    }

    protected _afterMount() {
        this._children[this._listName].reload();
    }


    static _styles: string[] = ['Controls-demo/List/VirtualScroll/resources/Common'];
}

export = EqualPages;
