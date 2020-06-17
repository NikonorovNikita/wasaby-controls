/**
 * Created by ps.borisov on 16.02.2018.
 */
define([
   'Controls/tabs',
   'Types/source',
   'Types/entity',
   'Types/collection'
], function(tabsMod, sourceLib, entity, collection) {
   describe('Controls/_tabs/Buttons', function() {
      it('prepareItemOrder', function() {
         var
            expected = '-ms-flex-order:2; order:2';
         assert.equal(expected, tabsMod.Buttons._private.prepareItemOrder(2), 'wrong order cross-brwoser styles');
      });
      it('initItems', function(done) {
         var
            tabInstance = new tabsMod.Buttons(),
            data = [
               {
                  id: 1,
                  title: 'Первый',
                  align: 'left'
               },
               {
                  id: 2,
                  title: 'Второй'
               },
               {
                  id: 3,
                  title: 'Третий',
                  align: 'left'
               },
               {
                  id: 4,
                  title: 'Четвертый'
               },
               {
                  id: 5,
                  title: 'Пятый'
               },
               {
                  id: 6,
                  title: 'Шестой',
                  align: 'left'
               },
               {
                  id: 7,
                  title: 'Седьмой'
               },
               {
                  id: 8,
                  title: 'Восьмой'
               },
               {
                  id: 9,
                  title: 'Девятый',
                  align: 'left'
               },
               {
                  id: 10,
                  title: 'Десятый'
               },
               {
                  id: 11,
                  title: 'Одиннадцатый'
               },
               {
                  id: 12,
                  title: 'Двенадцатый',
                  align: 'left'
               },
               {
                  id: 13,
                  title: 'Тринадцатый'
               }
            ],
            source = new sourceLib.Memory({
               data: data,
               keyProperty: 'id'
            });

         tabsMod.Buttons._private.initItems(source, tabInstance).addCallback(function(result) {
            var itemsOrder = result.itemsOrder;
            assert.equal(1, itemsOrder[0], 'incorrect  left order');
            assert.equal(30, itemsOrder[1], 'incorrect right order');
            assert.equal(5, itemsOrder[11], 'incorrect right order');
            assert.equal(36, itemsOrder[10], 'incorrect right order');
            assert.equal(37, tabInstance._lastRightOrder, 'incorrect last right order');
            tabInstance.destroy();
            done();
         });
      });
      it('prepareItemClass', function() {
         var
            item = new entity.Record({
               rawData: {
                  align: 'left',
                  karambola: '15',
                  _order: '144'
               }
            }),
            item2 = new entity.Record({
               rawData: {
                  karambola: '10',
                  _order: '2',
                  type: 'photo'
               }
            }),
            item3 = new entity.Record({
               rawData: {
                  karambola: '10',
                  _order: '2',
                  isMainTab: true
               }
            }),
            item4 = new entity.Record({
               rawData: {
                  karambola: '10',
                  _order: '2',
                  isMainTab: false
               }
            }),
            options = {
               style: 'additional',
               selectedKey: '15',
               keyProperty: 'karambola',
               theme: 'default'
            },
            expected = 'controls-Tabs__item controls-Tabs__item_theme_default ' +
               'controls-Tabs__item_align_left controls-Tabs__item_align_left_theme_default' +
               ' controls-Tabs__item_extreme controls-Tabs__item_extreme_theme_default ' +
               'controls-Tabs__item_extreme_first controls-Tabs__item_extreme_first_theme_default ' +
               'controls-Tabs__item_notShrink',
            expected2 = 'controls-Tabs__item controls-Tabs__item_theme_default' +
               ' controls-Tabs__item_align_right controls-Tabs__item_align_right_theme_default' +
               ' controls-Tabs__item_default controls-Tabs__item_default_theme_default' +
               ' controls-Tabs__item_type_photo controls-Tabs__item_type_photo_theme_default ' +
               'controls-Tabs__item_notShrink',
            expected3 = 'controls-Tabs__item controls-Tabs__item_theme_default ' +
               'controls-Tabs__item_align_right controls-Tabs__item_align_right_theme_default' +
               ' controls-Tabs__item_default controls-Tabs__item_default_theme_default' +
               ' controls-Tabs__item_canShrink',
            expected4 = 'controls-Tabs__item controls-Tabs__item_theme_default ' +
               'controls-Tabs__item_align_right controls-Tabs__item_align_right_theme_default' +
               ' controls-Tabs__item_extreme controls-Tabs__item_extreme_theme_default' +
               ' controls-Tabs__item_extreme_last controls-Tabs__item_extreme_last_theme_default' +
               ' controls-Tabs__item_notShrink';
         assert.equal(expected, tabsMod.Buttons._private.prepareItemClass(item, 1, options, 144), 'wrong order cross-brwoser styles');
         assert.equal(expected2, tabsMod.Buttons._private.prepareItemClass(item2, 2, options, 144), 'wrong order cross-brwoser styles');
         assert.equal(expected3, tabsMod.Buttons._private.prepareItemClass(item3, 2, options, 144));
         assert.equal(expected4, tabsMod.Buttons._private.prepareItemClass(item4, 144, options, 144));
      });
      it('prepareItemSelected', function() {
         var
            item = new entity.Record({
               rawData: {
                  align: 'left',
                  karambola: '15',
                  _order: '144'
               }
            }),
            item2 = new entity.Record({
               rawData: {
                  karambola: '10',
                  _order: '2',
                  type: 'photo'
               }
            }),
            options = {
               style: 'additional',
               selectedKey: '15',
               keyProperty: 'karambola',
               theme: 'default'
            },
            expected = 'controls-Tabs_style_secondary__item_state_selected ' +
            'controls-Tabs_style_secondary__item_state_selected_theme_default' +
            ' controls-Tabs__item_state_selected controls-Tabs__item_state_selected_theme_default',
            expected2 = 'controls-Tabs__item_state_default controls-Tabs__item_state_default_theme_default';
         assert.equal(expected, tabsMod.Buttons._private.prepareItemSelected(item, options), 'wrong order cross-brwoser styles');
         assert.equal(expected2, tabsMod.Buttons._private.prepareItemSelected(item2, options), 'wrong order cross-brwoser styles');
      });

      it('_beforeMount with received state', function() {
         var tabs = new tabsMod.Buttons(),
            receivedState = {
               items: [{id: '1'}],
               itemsOrder: 'itemsOrder'
            },
            options = {
               source: null
            };
         tabs._beforeMount(options, null, receivedState);
         assert.equal(tabs._items, receivedState.items, 'items uncorrect in beforeMount with receivedState');
         assert.equal(tabs._itemsOrder, receivedState.itemsOrder, 'items uncorrect in beforeMount with receivedState');
         tabs.destroy();
      });
      it('_beforeMount without received state', function() {
         var tabs = new tabsMod.Buttons(),
            data = [
               {
                  id: '1',
                  title: 'test1'
               }
            ],
            source = new sourceLib.Memory({
               data: data,
               keyProperty: 'id'
            }),
            options = {
               source: source
            };
         tabs._beforeMount(options).addCallback(function() {
            assert.equal(tabs._items.at(0).get('id') === '1', 'incorrect items _beforeMount without received state');
            assert.equal(tabs._items.at(0).get('title') === 'test1', 'incorrect items _beforeMount without received state');
            tabs.destroy();
            done();
         });
      });
      it('checkHasFunction', function() {
         var tabs = new tabsMod.Buttons(),
            data = [
               {
                  id: '1',
                  title: 'test1'
               }
            ],
            source = new sourceLib.Memory({
               data: data,
               idProperty: 'id'
            }),
            options = {
               source: source
            };
         //Тестируем: receivedState.items - RecordSet и есть функция
         let receivedState = {};
         receivedState.items = new collection.RecordSet({
            rawData: [
               {
                  id: 1, 'title': '1_Номенклатура', hierarchy: false,
                  func: function f() {
                     return 123;
                  }
               },
               {id: 2, 'title': '2_Ответственный', hierarchy: true},
               {id: 3, 'title': '3_Покупатель', hierarchy: null},
               {id: 4, 'title': '4_Склад', hierarchy: false}
            ],
         });
         assert.equal(true, tabs.checkHasFunction(receivedState));
         receivedState.items.destroy();

         //Тестируем: receivedState.items - RecordSet и нет функции
         receivedState.items = new collection.RecordSet({
            rawData: [
               { id: 1, 'title': '1_Номенклатура', hierarchy: false },
               { id: 2, 'title': '2_Ответственный', hierarchy: true },
               { id: 3, 'title': '3_Покупатель', hierarchy: null },
               { id: 4, 'title': '4_Склад', hierarchy: false },
            ],
         });
         assert.equal(false, tabs.checkHasFunction(receivedState));
         receivedState.items.destroy();

         //Тестируем: receivedState.items - массив объектов и есть функция
         receivedState.items = [
            {
               id: 1, 'title': '1_Номенклатура', hierarchy: false,
               func: function f() {
                  return 123;
               }
            },
            {id: 2, 'title': '2_Ответственный', hierarchy: true},
            {id: 3, 'title': '3_Покупатель', hierarchy: null},
            {id: 4, 'title': '4_Склад', hierarchy: false}
         ];
         assert.equal(true, tabs.checkHasFunction(receivedState));

         //Тестируем: receivedState.items - массив объектов и нет функции
         receivedState.items = [
            { id: 1, 'title': '1_Номенклатура', hierarchy: false },
            { id: 2, 'title': '2_Ответственный', hierarchy: true },
            { id: 3, 'title': '3_Покупатель', hierarchy: null },
            { id: 4, 'title': '4_Склад', hierarchy: false },
         ];
         assert.equal(false, tabs.checkHasFunction(receivedState));
      });
      it('_beforeUpdate', function() {
         var tabs = new tabsMod.Buttons(),
            data = [
               {
                  id: '1',
                  title: 'test1'
               }
            ],
            source = new sourceLib.Memory({
               data: data,
               keyProperty: 'id'
            }),
            options = {
               source: source
            },
            forceUpdateCalled = false,
            origForceUpdate = tabs._forceUpdate;
         tabs._forceUpdate = function() {
            forceUpdateCalled = true;
         };
         tabs._beforeUpdate(options).addCallback(function() {
            assert.equal(tabs._items.at(0).get('id') === '1', 'incorrect items _beforeUpdate without received state');
            assert.equal(tabs._items.at(0).get('title') === 'test1', 'incorrect items _beforeUpdate without received state');
            assert.equal(forceUpdateCalled, true, 'forceUpdate in _beforeUpdate does not called');
            tabs._forceUpdate = origForceUpdate;
            tabs.destroy();
            done();
         });
      });
      it('_onItemClick', function() {
         var tabs = new tabsMod.Buttons(),
            notifyCorrectCalled = false;
         tabs._notify = function(eventName) {
            if (eventName === 'selectedKeyChanged') {
               notifyCorrectCalled = true;
            }
         };
         tabs._onItemClick(null, 1);
         assert.equal(notifyCorrectCalled, true, 'uncorrect _onItemClick');
         tabs.destroy();
      });
      it('_prepareItemClass', function() {
         var tabs = new tabsMod.Buttons(),
            originalFunc = tabsMod.Buttons._private.prepareItemClass,
            prepareItemClassCorrectCalled = false;
         tabs._options = 'options';
         tabs._itemsOrder = [
            'itemsOrder'
         ];
         tabs._lastRightOrder = 'lastRightOrder';
         tabsMod.Buttons._private.prepareItemClass = function(item, itemsOrder, options, lastRightOrder) {
            if (item === 'item' && itemsOrder === 'itemsOrder' && options === 'options' && lastRightOrder === 'lastRightOrder') {
               prepareItemClassCorrectCalled = true;
            }
         };
         tabs._prepareItemClass('item', 0);
         assert.equal(prepareItemClassCorrectCalled, true, 'uncorrect _prepareItemClass');
         tabs.destroy();
         tabsMod.Buttons._private.prepareItemClass = originalFunc;
      });
      it('_prepareItemOrder', function() {
         var tabs = new tabsMod.Buttons(),
            originalFunc = tabsMod.Buttons._private.prepareItemOrder,
            prepareItemOrderCorrectCalled = false;
         tabs._itemsOrder = [
            'itemsOrder'
         ];
         tabsMod.Buttons._private.prepareItemOrder = function(itemsOrder) {
            if (itemsOrder === 'itemsOrder') {
               prepareItemOrderCorrectCalled = true;
            }
         };
         tabs._prepareItemOrder(0);
         assert.equal(prepareItemOrderCorrectCalled, true, 'uncorrect _prepareItemOrder');
         tabs.destroy();
         tabsMod.Buttons._private.prepareItemClass = originalFunc;
      });
   });
});
