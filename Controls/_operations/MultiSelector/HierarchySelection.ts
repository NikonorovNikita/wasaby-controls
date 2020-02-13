import { default as Selection, IOptions as ISelectionOptions} from 'Controls/_operations/MultiSelector/Selection';
import { relation } from 'Types/entity';
import ArraySimpleValuesUtil = require('Controls/Utils/ArraySimpleValuesUtil');
import removeSelectionChildren from 'Controls/_operations/MultiSelector/removeSelectionChildren';
import getChildrenIds from 'Controls/_operations/MultiSelector/getChildrenIds';
import cInstance = require('Core/core-instance');

import { Tree as TreeCollection } from 'Controls/display';
import { Rpc, PrefetchProxy } from 'Types/source';
import { ViewModel } from 'Controls/treeGrid';
import { RecordSet } from 'Types/collection';
import { TKeySelection as TKey, TKeysSelection as TKeys, ISelectionObject as ISelection } from 'Controls/interface/';
import TreeSelectionStrategy from 'Controls/_operations/MultiSelector/SelectionStrategy/Tree';

export interface IOptions extends ISelectionOptions {
   listModel: TreeCollection|ViewModel,
   parentProperty?: string,
   nodeProperty?: string,
   hasChildrenProperty?: string,
   selectionStrategy: TreeSelectionStrategy
};

interface IEntryPath {
   id: String|number|null,
   parent: String|number|null
}

const FIELD_ENTRY_PATH = 'ENTRY_PATH';

/**
 * @class Controls/_operations/MultiSelector/HierarchySelection
 * @extends Controls/_operations/MultiSelector/Selection
 * @author Авраменко А.С.
 * @deprecated Модуль устарел и будет удалён в версию 20.ххх. Будет использоваться сразу Controls/operations:TreeSelectionStrategy
 * @private
 */

/**
 * @name Controls/_operations/MultiSelector/HierarchySelection#nodeProperty
 * @cfg {String} Name of the field describing the type of the node (list, node, hidden node).
 */

/**
 * @name Controls/_operations/MultiSelector/HierarchySelection#parentProperty
 * @cfg {String} Name of the field that contains information about parent node.
 */
export default class HierarchySelection extends Selection {
   protected _selectionStrategy: TreeSelectionStrategy;
   protected _hierarchyRelation: relation.Hierarchy;

   constructor(options: IOptions): void {
      super(options);

      if (!cInstance.instanceOfModule(this._listModel, 'Controls/display:Tree')) {
         this._hierarchyRelation = new relation.Hierarchy({
            keyProperty: options.keyProperty || 'id',
            parentProperty: options.parentProperty || 'Раздел',
            nodeProperty: options.nodeProperty || 'Раздел@',
            declaredChildrenProperty: options.hasChildrenProperty || 'Раздел$'
         });
      }
   }

   select(keys: TKeys): void {
      let selection: ISelection = this._selectionStrategy.select(this.getSelection(), keys, this._listModel, this._hierarchyRelation);

      this._selectedKeys = selection.selected;
      this._excludedKeys = selection.excluded;
   }

   unselect(keys: TKeys): void {
      let selection: ISelection = this._selectionStrategy.unSelect(this.getSelection(), keys, this._listModel, this._hierarchyRelation);

      this._selectedKeys = selection.selected;
      this._excludedKeys = selection.excluded;
   }

   selectAll(): void {
      let rootId: TKey = this._getRoot();

      this.select([rootId]);
      this._removeChildrenIdsFromSelection(rootId);

      if (!this._excludedKeys.includes(rootId)) {
         this._excludedKeys = ArraySimpleValuesUtil.addSubArray(this._excludedKeys, [rootId]);
      }
   }

   unselectAll(): void {
      if (this._withEntryPath()) {
         this._unselectAllInRoot();
      } else {
         super.unselectAll();
      }
   }

   private _unselectAllInRoot() {
      let rootId: TKey = this._getRoot();
      let rootInExcluded = this._excludedKeys.includes(rootId);

      this.unselect([rootId]);
      this._removeChildrenIdsFromSelection(rootId);

      if (rootInExcluded) {
         this._excludedKeys = ArraySimpleValuesUtil.removeSubArray(this._excludedKeys, [rootId]);
      }
   }

   toggleAll(): void {
      const rootId: TKey = this._getRoot();
      const childrenIdsInRoot = getChildrenIds(rootId, this._listModel, this._hierarchyRelation);
      const intersectionChildIdsWithSelectedKeys = ArraySimpleValuesUtil.getIntersection(childrenIdsInRoot, this._selectedKeys);
      const intersectionChildIdsWithExcludedKeys = ArraySimpleValuesUtil.getIntersection(childrenIdsInRoot, this._excludedKeys);
      const rootExcluded = this._excludedKeys.includes(rootId);

      if (this._selectionStrategy.isAllSelected(this.getSelection(), rootId, this._listModel, this._hierarchyRelation)) {
         this._unselectAllInRoot();
      } else {
         this.selectAll();
      }

      if (rootExcluded) {
         ArraySimpleValuesUtil.removeSubArray(this._excludedKeys, [rootId]);
      }

      this._selectedKeys = ArraySimpleValuesUtil.addSubArray(this._selectedKeys, intersectionChildIdsWithExcludedKeys);
      this._excludedKeys = ArraySimpleValuesUtil.addSubArray(this._excludedKeys, intersectionChildIdsWithSelectedKeys);
   }

   getCount(): number|null {
      return this._selectionStrategy.getCount(this.getSelection(), this._listModel, 0, this._hierarchyRelation);
   }

   protected _getSelectionForModel(): void {
      return this._selectionStrategy.getSelectionForModel(this.getSelection(), this._listModel, 0, '', this._hierarchyRelation);
   }

   private _getRoot(): TKey {
      return this._listModel.getRoot().getContents();
   }

   private _removeChildrenIdsFromSelection(nodeId: Tkey): void {
      removeSelectionChildren(this.getSelection(), nodeId, this._listModel, this._hierarchyRelation);
   }

   private _withEntryPath(): boolean {
      return FIELD_ENTRY_PATH in this._getItems().getMetaData();
   }
}
