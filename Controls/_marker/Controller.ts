import uDimension = require('Controls/Utils/getDimensions');
import { IMarkerModel, IOptions, TKey, TVisibility, Visibility } from './interface';
import { CollectionItem } from 'Controls/display';
import { Model } from 'Types/entity';

/**
 * @class Controls/_marker/Controller
 * @author Панихин К.А.
 * @private
 */
export class Controller {
   private _model: IMarkerModel;
   private _markerVisibility: TVisibility;
   private _markedKey: TKey = null;

   constructor(options: IOptions) {
      this._model = options.model;
      this._markerVisibility = options.markerVisibility;
      const markedKey = this.calculateMarkedKey(options.markedKey);

      if (markedKey !== null) {
         this.setMarkedKey(markedKey);
      }
   }

   /**
    * Обновить состояние контроллера
    * @param options
    * @return {number|string} Ключ маркера
    */
   update(options: IOptions): TKey {
      if (this._model !== options.model) {
         this._model = options.model;
         this.restoreMarker();
      }
      this._markerVisibility = options.markerVisibility;

      const markedKey = this.calculateMarkedKey(options.markedKey);
      this.setMarkedKey(markedKey);
      return markedKey;
   }

   /**
    * Проставить маркер в модели
    */
   setMarkedKey(markedKey: TKey): void {
      if (this._markedKey !== markedKey) {
         this._model.setMarkedKey(this._markedKey, false);
         this._model.setMarkedKey(markedKey, true);
         this._markedKey = markedKey;
      }
   }

   /**
    * Получить текущий ключ маркера
    */
   getMarkedKey(): TKey {
      return this._markedKey;
   }

   /**
    * Если по переданному ключу не найден элемент, то возвращается ключ первого элемента или null
    * @param key ключ элемента, на который ставится маркер
    * @return {string|number} новый ключ маркера
    */
   calculateMarkedKey(key: TKey): TKey {
      if ((key === undefined || key === null) && this._markerVisibility !== Visibility.Visible) {
         return key;
      }

      const item = this._model.getItemBySourceKey(key);
      if (this._markedKey === key && item) {
         return key;
      }

      let resultKey = this._markedKey;
      if (item) {
         resultKey = key;
      } else {
         switch (this._markerVisibility) {
            case Visibility.OnActivated:
               // Маркер сбросим только если список не пустой и элемента с текущим маркером не найдено
               if (this._model.getCount() > 0) {
                  if (this._markedKey) {
                     resultKey = this.getFirstItemKey();
                  } else {
                     resultKey = null;
                  }
               }
               break;
            case Visibility.Visible:
               resultKey = this.getFirstItemKey();
               break;
         }
      }

      return resultKey;
   }

   /**
    * Проставляет заново маркер в модели
    */
   restoreMarker(): void {
      const item = this._model.getItemBySourceKey(this._markedKey);
      if (item) {
         item.setMarked(true);
      }
   }

   /**
    * Переместить маркер на следующий элемент
    * @return ключ, на который поставлен маркер
    */
   moveMarkerToNext(): TKey {
      const nextItem = this._model.getNextByKey(this._markedKey);
      if (!nextItem) {
         return this._markedKey;
      }

      return this._getKey(nextItem);
   }

   /**
    * Переместить маркер на предыдущий элемент
    * @return ключ, на который поставлен маркер
    */
   moveMarkerToPrev(): TKey {
      const prevItem = this._model.getPrevByKey(this._markedKey);
      if (!prevItem) {
         return this._markedKey;
      }

      return this._getKey(prevItem);
   }

   /**
    * Обработчк удаления элементов
    * Ставит маркер на следующий элемент, при его отустствии на предыдущий, иначе сбрасывает маркер
    * @param removedItemsIndex Индекс удаленной записи в исходной коллекции (RecordSet)
    */
   handleRemoveItems(removedItemsIndex: number): TKey {
      // Если элемент с текущем маркером не удален, то маркер не нужно менять
      const item = this._model.getItemBySourceKey(this._markedKey);
      if (item) {
         return this._markedKey;
      }

      // Нам приходит индекс в исходной коллекции и его нужно перевести в индекс проекции
      const indexInProjection = this._model.getIndexBySourceIndex(removedItemsIndex);
      const nextItem = this._model.getNextByIndex(indexInProjection);
      const prevItem = this._model.getPrevByIndex(indexInProjection);

      let newMarkedKey;
      if (nextItem) {
         newMarkedKey = this.calculateMarkedKey(this._getKey(nextItem));
      } else if (prevItem) {
         newMarkedKey = this.calculateMarkedKey(this._getKey(prevItem));
      } else {
         newMarkedKey = this.calculateMarkedKey(null);
      }

      return newMarkedKey;
   }

   /**
    * Устанавливает маркер на первый элемент, который полностью виден на странице
    * @param items список HTMLElement-ов на странице
    * @param verticalOffset вертикальное смещение скролла
    */
   setMarkerOnFirstVisibleItem(items: HTMLElement[], verticalOffset: number): TKey {
      let firstItemIndex = this._model.getStartIndex();
      firstItemIndex += this._getFirstVisibleItemIndex(items, verticalOffset);
      firstItemIndex = Math.min(firstItemIndex, this._model.getStopIndex());

      let newMarkedKey;
      const item = this._model.getValidItemForMarker(firstItemIndex);
      if (item) {
         const itemKey = this._getKey(item);
         newMarkedKey = this.calculateMarkedKey(itemKey);
      } else {
         newMarkedKey = this.calculateMarkedKey(null);
      }

      return newMarkedKey;
   }

   /*
      TODO нужно выпилить этот метод при переписывании моделей. item.getContents() должен возвращать Record
       https://online.sbis.ru/opendoc.html?guid=acd18e5d-3250-4e5d-87ba-96b937d8df13
   */
   private _getKey(item: CollectionItem<Model>): TKey {
      let contents = item.getContents();
      if (item['[Controls/_display/BreadcrumbsItem]'] || item.breadCrumbs) {
         contents = contents[(contents as any).length - 1];
      }
      return contents.getKey();
   }

   /**
    * Возвращает ключ первого элемента модели
    * @private
    */
   private getFirstItemKey(): TKey {
      if (!this._model.getCount()) {
         return null;
      }

      const firstItem = this._model.getFirstItem();
      if (!firstItem) {
         return null;
      }

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
