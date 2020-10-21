import {QueryWhereExpression} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {ISearchControllerOptions, ISearchController} from './interface';

type Key = string|number|null;

const SERVICE_FILTERS = {
   HIERARCHY: {
      'Разворот': 'С разворотом',
      'usePages': 'full'
   }
};

export default class ControllerClass implements ISearchController {
   protected _options: ISearchControllerOptions = null;

   protected _searchValue: string = '';
   private _root: Key = null;
   private _path: RecordSet = null;

   constructor(options: ISearchControllerOptions) {
      this._options = options;

      if (options.root !== undefined) {
         this.setRoot(options.root);
      }
   }

   reset(): Promise<RecordSet> {
      const filter = {...this._options.sourceController.getFilter()};
      filter[this._options.searchParam] = this._searchValue = '';

      if (this._options.parentProperty) {
         for (const i in SERVICE_FILTERS.HIERARCHY) {
            if (SERVICE_FILTERS.HIERARCHY.hasOwnProperty(i)) {
               delete filter[i];
            }
         }

         this._deleteRootFromFilter(filter);
      }

      return this._updateFilterAndLoad(filter);
   }

   search(value: string): Promise<RecordSet> {
      const filter: QueryWhereExpression<unknown> = {...this._options.sourceController.getFilter()};

      filter[this._options.searchParam] = this._searchValue = this._trim(value);

      if (this._root !== undefined && this._options.parentProperty) {
         if (this._options.startingWith === 'current') {
            filter[this._options.parentProperty] = this._root;
         } else {
             const root = ControllerClass._getRoot(this._path, this._root, this._options.parentProperty);
             if (root !== undefined) {
                 filter[this._options.parentProperty] = root;
             } else {
                 delete filter[this._options.parentProperty];
             }
         }
      }

      if (this._options.parentProperty) {
         Object.assign(filter, SERVICE_FILTERS.HIERARCHY);
      }

      return this._updateFilterAndLoad(filter);
   }

   update(options: Partial<ISearchControllerOptions>): void {
      const needUpdateRoot = this._options.root !== options.root;

      if (needUpdateRoot) {
         this.setRoot(options.root);
      }

      if (options.hasOwnProperty('searchValue')) {
         if (options?.searchValue !== this._searchValue) {
            if (options.searchValue) {
               this.search(options.searchValue).then();
            } else {
               this.reset().then();
            }
         }
      }
      this._options = {
         ...this._options,
         ...options
      };
   }

   setRoot(value: Key): void {
      this._root = value;
   }

   getRoot(): Key {
      return this._root;
   }

   private _updateFilterAndLoad(filter: QueryWhereExpression<unknown>): Promise<RecordSet> {
      const sourceController = this._options.sourceController;

      sourceController.setFilter(filter);
      return sourceController.load().then((recordSet) => {
         if (recordSet instanceof RecordSet) {
            this._path = recordSet.getMetaData().path;

            return recordSet as RecordSet;
         }
      });
   }

   private _deleteRootFromFilter(filter: QueryWhereExpression<unknown>): void {
      if (this._options.startingWith === 'current') {
         delete filter[this._options.parentProperty];
      }
   }

   private _trim(value: string): string {
      return this._options.searchValueTrim && value ? value.trim() : value;
   }

    static _getRoot(path: RecordSet, currentRoot: Key, parentProperty: string): Key {
        let root;

        if (path && path.getCount() > 0) {
            root = path.at(0).get(parentProperty);
        } else {
            root = currentRoot;
        }

        return root;
    }
}
