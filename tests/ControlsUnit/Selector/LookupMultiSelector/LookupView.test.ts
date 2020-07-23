import {default as Lookup} from 'Controls/_lookup/MultipleInput';
import {Model} from 'Types/entity';
import {List} from 'Types/collection';
import {strictEqual, ok} from 'assert';

function getItems(countItems: number): List<Model> {
   const items = [];
   for (; countItems; countItems--) {
      items.push(new Model({
         rawData: {id: countItems},
         keyProperty: 'id'
      }));
   }

   return new List({
      items
   });
}

describe('Controls/_lookup/MultipleInput/LookupView', () => {
   it('getAvailableWidthCollection', () => {
      const placeholderWidth = 35;
      const fieldWrapperWidth = 145;
      const lookupView = new Lookup();
      const originGetPlaceholderWidth = Lookup._getPlaceholderWidth;
      // Избавимся от работы с версткой
      Lookup._getPlaceholderWidth = function() {
         return placeholderWidth;
      };
      lookupView._getFieldWrapperWidth = function() {
         return  fieldWrapperWidth;
      };
      lookupView._initializeConstants = () => {};

      lookupView._items =  getItems(3);
      strictEqual(lookupView._getAvailableWidthCollection({
         maxVisibleItems: 3
      }), fieldWrapperWidth);

      lookupView._items =  getItems(2);
      strictEqual(lookupView._getAvailableWidthCollection({
         maxVisibleItems: 3
      }), fieldWrapperWidth - placeholderWidth);
      Lookup._getPlaceholderWidth = originGetPlaceholderWidth;
   });

   it('_calculateSizes', function() {
      var
         availableWidthCollection = 200,
         lookupView = new Lookup();

      lookupView._getAvailableWidthCollection = function() {
         return availableWidthCollection;
      };
      lookupView._items = getItems(2);
      lookupView._calculateSizes({
         maxVisibleItems: 5
      });
      strictEqual(lookupView._maxVisibleItems, 2);
      strictEqual(lookupView._availableWidthCollection, availableWidthCollection);
   });

   it('_isInputVisible', function() {
      var lookupView = new Lookup();

      lookupView._items = getItems(5);
      lookupView._options.maxVisibleItems = 5;
      ok(!lookupView._isInputVisible(lookupView._options));

      lookupView._options.maxVisibleItems = 6;
      ok(lookupView._isInputVisible(lookupView._options));

      lookupView._options.readOnly = true;
      ok(!!!lookupView._isInputVisible(lookupView._options));
   });

   it('_isNeedCalculatingSizes', function() {
      var lookupView = new Lookup();

      lookupView._items = getItems(0);
      ok(!lookupView._isNeedCalculatingSizes({}));

      lookupView._items = getItems(5);
      ok(lookupView._isNeedCalculatingSizes({}));

      lookupView._items = getItems(5);
      ok(!lookupView._isNeedCalculatingSizes({
         readOnly: true
      }));
   });
});

