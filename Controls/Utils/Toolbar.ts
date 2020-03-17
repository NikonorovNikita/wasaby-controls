/**
 * Утилита для Toolbar
 *  - содержит константы
 *  - фильтр для элементов меню
 */
import {factory, Abstract as ChainAbstract} from 'Types/chain';
import {RecordSet} from 'Types/collection';
import {Record} from 'Types/entity';

export interface IShowType {
   /**
    * Show only in Menu.
    */
   MENU: number;
   /**
    * Show in Menu and Toolbar.
    */
   MENU_TOOLBAR: number;
   /**
    * Show only in Toolbar
    */
   TOOLBAR: number;
}

export enum showType {
   MENU,
   MENU_TOOLBAR,
   TOOLBAR
}

export function getMenuItems<T extends Record>(items: RecordSet<T> | T[]): ChainAbstract<T> {
   return factory(items).filter((item) => {
      return item.get('showType') !== this.showType.TOOLBAR;
   });
}
