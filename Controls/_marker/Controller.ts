import uDimension = require('Controls/Utils/getDimensions');
import { IMarkerModel, IOptions, TVisibility, Visibility, TKey } from './interface';

export class Controller {
   private _model: IMarkerModel;
   private _markerVisibility: TVisibility;
   private _markedKey: TKey;

   constructor(options: IOptions) {
      this._model = options.model;
      this._markerVisibility = options.markerVisibility;
      this.setMarkedKey(options.markedKey);
   }

   /**
    * Обновить состояние контроллера
    * @param options
    */
   update(options: IOptions): void {
      this._model = options.model;
      this._markerVisibility = options.markerVisibility;
      this.setMarkedKey(options.markedKey);
   }

   /**
    * Снимает старый маркер и ставит новый
    * Если по переданному ключу не найден элемент, то маркер ставится на первый элемент списка
    * @param key ключ элемента, на который ставится маркер
    */
   setMarkedKey(key: TKey): void {
      if (key === undefined || this._markedKey === key || !this._model) {
         return;
      }

      this._model.setMarkedKey(this._markedKey, false);
      if (this._model.getItemBySourceKey(key)) {
         this._model.setMarkedKey(key, true);
         this._markedKey = key;
      } else {
         this._markedKey = this._setMarkerOnFirstItem();
      }
   }

   /**
    * Переместить маркер на следующий элемент
    * @return ключ, на который поставлен маркер
    */
   moveMarkerToNext(): TKey {
      const nextItem = this._model.getNextByKey(this._markedKey);
      const nextKey = nextItem.getContents().getKey();
      this.setMarkedKey(nextKey);
      return nextKey;
   }

   /**
    * Переместить маркер на предыдущий элемент
    * @return ключ, на который поставлен маркер
    */
   moveMarkerToPrev(): TKey {
      const prevItem = this._model.getPrevByKey(this._markedKey);
      const prevKey = prevItem.getContents().getKey();
      this.setMarkedKey(prevKey);
      return prevKey;
   }

   handleRemoveItems(removedItemsIndex: number): void {
      const nextItem = this._model.getNextByIndex(removedItemsIndex);
      const prevItem = this._model.getPrevByIndex(removedItemsIndex);

      const nextKey = nextItem.getContents().getKey();
      const prevKey = prevItem.getContents().getKey();

      if (nextKey) {
         this.setMarkedKey(nextKey);
      } else if (prevKey) {
         this.setMarkedKey(prevKey);
      } else {
         this.setMarkedKey(null);
      }
   }

   setMarkerOnFirstVisibleItem(items: HTMLElement[], verticalOffset: number): void {
      let firstItemIndex = this._model.getStartIndex();
      firstItemIndex += this._getFirstVisibleItemIndex(items, verticalOffset);
      firstItemIndex = Math.min(firstItemIndex, this._model.getStopIndex());

      const item = this._model.getValidItemForMarker(firstItemIndex);
      const itemKey = item.getContents().getKey();
      this.setMarkedKey(itemKey);
   }

   private _setMarkerOnFirstItem(): TKey {
      // если модель пустая, то не на что ставить маркер
      // если onactivated режим и маркер вручную не проставили, то не ставим его на первый элемент
      if (!this._model.getCount() || this._markerVisibility === Visibility.OnActivated && this._markedKey !== null) {
         return undefined;
      }

      const firstItem = this._model.getFirstItem();
      this._model.setMarkedKey(firstItem.getKey(), true);
      return firstItem.getKey();
   }

   private _getFirstVisibleItemIndex(items: HTMLElement[], verticalOffset: number): number {
      const itemsCount = items.length;
      let itemsHeight = 0;
      let i = 0;
      if (verticalOffset <= 0) {
         return 0;
      }
      while (itemsHeight < verticalOffset && i < itemsCount) {
         itemsHeight += uDimension(items[i]).height;
         i++;
      }
      return i;
   }
}
