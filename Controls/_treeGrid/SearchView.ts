import {TemplateFunction} from "UI/Base";
import {GridView} from 'Controls/grid';
import SearchItemTpl = require('wml!Controls/_treeGrid/SearchView/Item');
import 'Controls/decorator';
import 'wml!Controls/_treeGrid/SearchView/SearchBreadCrumbsContent';
import * as GridItemTemplate from 'wml!Controls/_treeGrid/TreeGridView/layout/grid/Item';
import * as TableItemTemplate from 'wml!Controls/_treeGrid/TreeGridView/layout/table/Item';
import {isFullGridSupport} from './../_grid/utils/GridLayoutUtil';

var
    SearchView = GridView.extend({
        _itemClickNotifiedByPathClick: false,
        _resolveItemTemplate() {
           return SearchItemTpl;
        },
        _resolveBaseItemTemplate(): TemplateFunction {
            return isFullGridSupport() ? GridItemTemplate : TableItemTemplate;
        },
        _onSearchItemClick(e, item): void {
            if (!this._itemClickNotifiedByPathClick) {
                const lastBreadCrumb = item.getContents()[item.getContents().length - 1];
                if (lastBreadCrumb) {
                    this._notify('itemClick', [lastBreadCrumb, e], {bubbling: true});
                }
            }
            this._itemClickNotifiedByPathClick = false;
            e.stopPropagation();
        },
        _onSearchPathClick(e, item): void {
           this._notify('itemClick', [item, e], {bubbling: true});
           this._itemClickNotifiedByPathClick = true;
        },
        getDefaultOptions() {
            return {
                leftPadding: 'S'
            };
        }
    });

export = SearchView;
