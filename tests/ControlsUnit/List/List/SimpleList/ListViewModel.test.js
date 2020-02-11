/**
 * Created by kraynovdo on 17.11.2017.
 */
define([
   'Controls/list',
   'Types/collection',
   'Types/entity'
], function(
   lists,
   collection,
   entity
) {
   describe('Controls.List.ListControl.ListViewModel', function() {
      var data;
      beforeEach(function() {
         data = [
            {
               id: 1,
               title: 'Первый',
               type: 1
            },
            {
               id: 2,
               title: 'Второй',
               type: 2
            },
            {
               id: 3,
               title: 'Третий',
               type: 2
            }
         ];
      });

      it('getFirstItem and getLastItem', function() {
         var
            cfg = {
               items: new collection.RecordSet({
                  rawData: data,
                  keyProperty: 'id'
               }),
               keyProperty: 'id',
               displayProperty: 'title'
            },
            model = new lists.ListViewModel(cfg);
         assert.equal(model.getFirstItem(), model.getItems().at(0));
         assert.equal(model.getLastItem(), model.getItems().at(2));
      });

      it('_calcItemVersion', function() {
         var
            version,
            cfg = {
               items: new collection.RecordSet({
                  rawData: data,
                  keyProperty: 'id'
               }),
               keyProperty: 'id',
               displayProperty: 'title'
            },
            model = new lists.ListViewModel(cfg),
            key = 1,
            itemData = model.getItemDataByItem(model.getItemById(key)),
            item = itemData.item;

         model._markedKey = 1;
         version = model._calcItemVersion(item, key);
         assert.include(version, 'MARKED');

         model.setDragEntity({
            getItems: function() {
               return [1, 2];
            }
         });
         version = model._calcItemVersion(item, key);
         assert.include(version, 'DRAG_ITEM');

         model._dragTargetPosition = {
            item: item,
            position: 'AFTER'
         };
         version = model._calcItemVersion(item, key);
         assert.include(version, 'DRAG_POSITION_AFTER');

         model._dragTargetPosition = {
            item: item,
            position: 'BEFORE'
         };
         version = model._calcItemVersion(item, key);
         assert.include(version, 'DRAG_POSITION_BEFORE');

         model._reloadedKeys[key] = true;
         version = model._calcItemVersion(item, key);
         assert.include(version, 'RELOADED');

         model.clearReloadedMarks();
         version = model._calcItemVersion(item, key);
         assert.notInclude(version, 'RELOADED');

         model.setSwipeItem(itemData);
         version = model._calcItemVersion(item, key);
         assert.include(version, 'SWIPE');

         model.setSwipeItem(null);
         version = model._calcItemVersion(item, key);
         assert.notInclude(version, 'SWIPE');

         model.setItemActions(model._items.at(0), [{
            id: 0,
            title: 'first'
         }]);
         version = model._calcItemVersion(item, key);
         assert.include(version, 'ITEM_ACTION_1');

         model.setItemActions(model._items.at(0), [{
            id: 0,
            title: 'second'
         }]);
         version = model._calcItemVersion(item, key);
         assert.include(version, 'ITEM_ACTION_2');

         model.setItemActions(model._items.at(0), [{
            id: 0,
            title: 'second'
         }]);
         version = model._calcItemVersion(item, key);
         assert.include(version, 'ITEM_ACTION_2');

         assert.include(version, 'WITHOUT_EDITING');
         model._setEditingItemData({ key: 21, item: {} });
         version = model._calcItemVersion(item, key);
         assert.include(version, 'WITH_EDITING');
      });

      it('markItemReloaded', () => {
         var
            cfg = {
               items: new collection.RecordSet({
                  rawData: data,
                  keyProperty: 'id'
               }),
               keyProperty: 'id',
               displayProperty: 'title'
            },
            model = new lists.ListViewModel(cfg),
            key = 1,
            itemData = model.getItemDataByItem(model.getItemById(key)),
            item = itemData.item;

         assert.notInclude(model._calcItemVersion(item, key), 'RELOADED');

         model.markItemReloaded(key);
         const firstReloadVersion = model._calcItemVersion(item, key);

         model.markItemReloaded(key);
         const secondReloadVersion = model._calcItemVersion(item, key);

         assert.include(firstReloadVersion, 'RELOADED');
         assert.include(secondReloadVersion, 'RELOADED');
         assert.notStrictEqual(firstReloadVersion, secondReloadVersion);
      });

      it('getCurrent', function() {
         var cfg = {
            items: new collection.RecordSet({
               rawData: data,
               keyProperty: 'id'
            }),
            keyProperty: 'id',
            displayProperty: 'title',
            markedKey: 1,
            markerVisibility: 'visible',
            selectedKeys: {1: true}
         };

         var iv = new lists.ListViewModel(cfg);

         var cur = iv.getCurrent();
         assert.equal('id', cur.keyProperty, 'Incorrect field set on getCurrent()');
         assert.equal('title', cur.displayProperty, 'Incorrect field set on getCurrent()');
         assert.equal(0, cur.index, 'Incorrect field set on getCurrent()');
         assert.deepEqual(cfg.items.at(0), cur.item, 'Incorrect field set on getCurrent()');
         assert.isTrue(cur.isSelected, 'Incorrect field set on getCurrent()');
         assert.isTrue(cur.multiSelectStatus, 'Incorrect field set on getCurrent()');
      });

      it('isSelected', function () {
         const
             cfg = {
                items: new collection.RecordSet({
                   rawData: data,
                   keyProperty: 'id'
                }),
                keyProperty: 'id',
                displayProperty: 'title',
                markedKey: 1,
                markerVisibility: 'visible',
                selectedKeys: {1: true}
             },
             iv = new lists.ListViewModel(cfg);

         assert.isTrue(lists.ListViewModel._private.isSelected(iv, iv.getCurrent()));
         iv.goToNext();
         assert.isFalse(lists.ListViewModel._private.isSelected(iv, iv.getCurrent()));
      });

      it('getItemByMarkedKey', function () {
         const
             cfg = {
                items: new collection.RecordSet({
                   rawData: data,
                   keyProperty: 'id'
                }),
                keyProperty: 'id',
                displayProperty: 'title',
                markedKey: 1,
                markerVisibility: 'visible',
                selectedKeys: {1: true}
             },
             iv = new lists.ListViewModel(cfg);

         let edditingItem = {
            key: 21,
            item: {
               qwe: 123,
               asd: 456
            }
         };

         assert.deepEqual(cfg.items.at(0), lists.ListViewModel._private.getItemByMarkedKey(iv, 1).getContents());
         iv._setEditingItemData(edditingItem);
         assert.deepEqual(cfg.items.at(0), lists.ListViewModel._private.getItemByMarkedKey(iv, 1).getContents());
         assert.isUndefined(lists.ListViewModel._private.getItemByMarkedKey(iv, 21));
         edditingItem.isAdd = true;
         iv._markedKey = 21;
         assert.deepEqual(edditingItem.item, lists.ListViewModel._private.getItemByMarkedKey(iv, 21));
      });

      it('markAddingItem && restoreMarker', function () {
         const
             cfg = {
                items: new collection.RecordSet({
                   rawData: data,
                   keyProperty: 'id'
                }),
                markedKey: 1,
                keyProperty: 'id',
                displayProperty: 'title',
                markerVisibility: 'onactivated',
             },
             iv = new lists.ListViewModel(cfg);

         let modelVersion = 0;

         iv._nextModelVersion = () => {
            modelVersion++;
         };

         assert.isUndefined(iv._savedMarkedKey);
         assert.equal(1, iv._markedKey);

         iv._editingItemData = {key: 123};
         iv.markAddingItem();
         assert.equal(1, iv._savedMarkedKey);
         assert.equal(123, iv._markedKey);


         iv.restoreMarker();
         assert.isUndefined(iv._savedMarkedKey);
         assert.equal(1, iv._markedKey);
      });

      describe('needToDrawActions', function () {
         let needToDrawActions = lists.ListViewModel._private.needToDrawActions;
         let currentItem = {
               key: 1
             },
             editingItem = {
               key: 1
             },
             editingConfig = {
               toolbarVisibility: true
             },
             drawnActions = [1];
         it('editing with actions and toolbar', function() {
            assert.isTrue(needToDrawActions(editingItem, currentItem, editingConfig, drawnActions));
            assert.isFalse(needToDrawActions(editingItem, {key: 2}, editingConfig, drawnActions));
         });
         it('editing without actions and with toolbar', function() {
            drawnActions = [];
            assert.isTrue(needToDrawActions(editingItem, currentItem, editingConfig, drawnActions));
            assert.isFalse(needToDrawActions(editingItem, {key: 2}, editingConfig, drawnActions));
         });
         it('editing with actions and without toolbar', function() {
            drawnActions = [1];
            editingConfig.toolbarVisibility = false;
            assert.isTrue(needToDrawActions(editingItem, currentItem, editingConfig, drawnActions));
            assert.isFalse(needToDrawActions(editingItem, {key: 2}, editingConfig, drawnActions));
         });
         it('editing without actions and without toolbar', function() {
            drawnActions = [];
            editingConfig.toolbarVisibility = false;
            assert.isFalse(needToDrawActions(editingItem, currentItem, editingConfig, drawnActions));
            assert.isFalse(needToDrawActions(editingItem, {key: 2}, editingConfig, drawnActions));
         });
         it('without actions', function() {
            editingItem = null;
            assert.isFalse(needToDrawActions(editingItem, currentItem, editingConfig, drawnActions));
         });
         it('with actions', function() {
            drawnActions = [1]
            assert.isTrue(needToDrawActions(editingItem, currentItem, editingConfig, drawnActions));
         });
      });

      it('updateIndexes', function() {
         var
            items = new collection.RecordSet({
               rawData: [
                  { id: 1, title: 'item 1' },
                  { id: 2, title: 'item 2' },
                  { id: 3, title: 'item 3' },
                  { id: 4, title: 'item 4' }
               ],
               keyProperty: 'id'
            }),
            model = new lists.ListViewModel({
               keyProperty: 'id',
               items: new collection.RecordSet({
                  rawData: [],
                  keyProperty: 'id'
               }),
               virtualScrolling: true
            });
         assert.equal(model._startIndex, 0, 'Invalid value of "_startIndex" after constructor.');
         assert.equal(model._stopIndex, 0, 'Invalid value of "_stopIndex" after constructor.');
         model.setItems(items);
         assert.equal(model._startIndex, 0, 'Invalid value of "_startIndex" after setItems(items).');
         assert.equal(model._stopIndex, 4, 'Invalid value of "_stopIndex" after setItems(items).');
         model.subscribe('onListChange', function() {
            assert.equal(model._startIndex, 0, 'Invalid value of "_startIndex" after items.removeAt(0) in onListChange handler.');
            assert.equal(model._stopIndex, 3, 'Invalid value of "_stopIndex" after items.removeAt(0) in onListChange handler.');
         });
         model.getItems().removeAt(0);
         assert.equal(model._startIndex, 0, 'Invalid value of "_startIndex" after items.removeAt(0).');
         assert.equal(model._stopIndex, 3, 'Invalid value of "_stopIndex" after items.removeAt(0).');
         model._display.setFilter(function(item) {
            return item.getId() !== 3;
         });
         assert.equal(model._startIndex, 0, 'Invalid value of "_startIndex" after items.removeAt(0).');
         assert.equal(model._stopIndex, 2, 'Invalid value of "_stopIndex" after items.removeAt(0).');
      });

      it('set marker after setting items', function() {
         var
             items = new collection.RecordSet({
                rawData: [
                   { id: 1, title: 'item 1' }
                ],
                keyProperty: 'id'
             }),
             model = new lists.ListViewModel({
                keyProperty: 'id',
                items: new collection.RecordSet({
                   rawData: [],
                   keyProperty: 'id'
                }),
                markedKey: null
             }),
            modelWithoutItems = new lists.ListViewModel({
               markerVisibility: 'visible',
               keyProperty: 'id',
               markedKey: 1
            });

         // Should not set marker
         model._options.markerVisibility = 'hidden';
         model.setItems(items);
         assert.equal(undefined, model._markedKey);

         model._options.markerVisibility = 'onactivated';
         model.setItems(items);
         assert.equal(undefined, model._markedKey);

         // Should set marker
         model._options.markerVisibility = 'visible';
         model.setItems(items);
         assert.equal(1, model._markedKey);
         model._markedKey = 0;

         model._options.markerVisibility = 'always';
         model.setItems(items);
         assert.equal(1, model._markedKey);

         var
            markedKeyChangedCalled = false,
            cb = function() {
               markedKeyChangedCalled = true;
            };
         model.subscribe('onMarkedKeyChanged', cb);
         assert.equal(modelWithoutItems._markedKey, null);
         modelWithoutItems.setItems(items);
         assert.equal(modelWithoutItems._markedKey, 1);
         model.unsubscribe('onMarkedKeyChanged', cb);
         assert.isFalse(markedKeyChangedCalled);
      });

      it('should set markerFrom state', function () {

         var
             items = new collection.RecordSet({
                rawData: [
                   { id: 2, title: 'item 2' },
                   { id: 3, title: 'item 3' }
                ],
                keyProperty: 'id'
             }),
             model = new lists.ListViewModel({
                keyProperty: 'id',
                items: new collection.RecordSet({
                   rawData: [
                      { id: 1, title: 'item 1' }
                   ],
                   keyProperty: 'id'
                }),
                markerVisibility: 'visible',
                markedKey: 1
             });

         model._markedKey = 2;
         model.setItems(items);
         assert.equal(2, model._markedKey);

      });

      it('set marker on ctor', function() {

         var cfg = {
                keyProperty: 'id',
                items: new collection.RecordSet({
                   rawData: [
                      {id: 1, title: 'item 1'},
                      {id: 2, title: 'item 2'},
                      {id: 3, title: 'item 3'}
                   ],
                   keyProperty: 'id'
                }),
                markedKey: null
             },
             model;

         // Should not set marker
         cfg.markedKey = null;
         cfg.markerVisibility = 'onactivated';
         model = new lists.ListViewModel(cfg);
         assert.equal(undefined, model._markedKey);

         cfg.markedKey = null;
         cfg.markerVisibility = 'hidden';
         model = new lists.ListViewModel(cfg);
         assert.equal(undefined, model._markedKey);

         cfg.markedKey = 1;
         cfg.markerVisibility = 'hidden';
         model = new lists.ListViewModel(cfg);
         assert.equal(undefined, model._markedKey);



         // Should set marker
         cfg.markedKey = 2;
         cfg.markerVisibility = 'onactivated';
         model = new lists.ListViewModel(cfg);
         assert.equal(2, model._markedKey);

         cfg.markedKey = null;
         cfg.markerVisibility = 'always';
         model = new lists.ListViewModel(cfg);
         assert.equal(1, model._markedKey);

         cfg.markedKey = null;
         cfg.markerVisibility = 'visible';
         model = new lists.ListViewModel(cfg);
         assert.equal(1, model._markedKey);

         cfg.markedKey = 2;
         cfg.markerVisibility = 'always';
         model = new lists.ListViewModel(cfg);
         assert.equal(2, model._markedKey);

         cfg.markedKey = 2;
         cfg.markerVisibility = 'visible';
         model = new lists.ListViewModel(cfg);
         assert.equal(2, model._markedKey);


      });
      it('setMarkerOnValidItem', function() {
         var cfg = {
            keyProperty: 'id',
            items: new collection.RecordSet({
               rawData: [
                  { id: 1, title: 'item 1', type: 1 },
                  { id: 2, title: 'item 2', type: 1 },
                  { id: 3, title: 'item 3', type: 1 },
                  { id: 4, title: 'item 4', type: 2 },
                  { id: 5, title: 'item 5', type: 2 },
                  { id: 6, title: 'item 6', type: 3 },
                  { id: 7, title: 'item 7', type: 4 },
               ],
               keyProperty: 'id'
            }),
            groupingKeyCallback: function(item) {
               return item.get('type');
            }
         };
         var model = new lists.ListViewModel(cfg);

         model.setCollapsedGroups([2,3,4]);

         /*
            ---------- 1 ----------
            item 1
            item 2
            item 3
            ---------- 2 ----------
            ---------- 3 ----------
            ---------- 4 ----------
          */
         model.setMarkerOnValidItem(0);
         assert.equal(model.getMarkedKey(), 1);
         model.setMarkerOnValidItem(1);
         assert.equal(model.getMarkedKey(), 1);
         model.setMarkerOnValidItem(4);
         assert.equal(model.getMarkedKey(), 3);
      });

      it('SetMarkerOnRemove', function() {
         var cfg = {
               keyProperty: 'id',
               items: new collection.RecordSet({
                  rawData: [
                     { id: 1, title: 'item 1', type: 1 },
                     { id: 2, title: 'item 2', type: 2 },
                     { id: 3, title: 'item 3', type: 1 },
                     { id: 4, title: 'item 4', type: 2 },
                     { id: 5, title: 'item 5', type: 1 },
                     { id: 6, title: 'item 6', type: 3 }
                  ],
                  keyProperty: 'id'
               }),
            groupingKeyCallback: function(item) {
               return item.get('type');
               }
            };
            var model;

            /*
               ---------- 1 ---------
               item 1
               item 3
               item 5
               ---------- 2 ----------
               item 2
               item 4

               item 6
             */


            cfg.markedKey = 3; // item 3, (item.index = 2)
            model = new lists.ListViewModel(cfg);
            // remove item 3
            model.getItems().removeAt(2);
            assert.equal(5, model.getMarkedKey()); // expect marker on item 1

         /*
               ---------- 1 ---------
               item 1
               item 5
               ---------- 2 ----------
               item 2
               item 4

               item 6
             */

            cfg.markedKey = 2;
            model = new lists.ListViewModel(cfg);
            // remove item 2 (item placed, before group expander)
            model.getItems().removeAt(1);
            assert.equal(4, model.getMarkedKey()); // expected marker on item 5

         /*
              ---------- 1 ---------
              item 1
              item 5
              ---------- 2 ----------
              item 4

              item 6
         */

            cfg.markedKey = 1;
            model = new lists.ListViewModel(cfg);
            model.getItems().removeAt(3); // remove item 6 (without markedKey)
            assert.equal(1, model.getMarkedKey());

         //remove last item. marked key must be null
         cfg = {
            keyProperty: 'id',
            items: new collection.RecordSet({
               rawData: [
                  { id: 1, title: 'item 1' },

               ],
               idProperty: 'id'
            }),
            markedKey: 1
         };
         model = new lists.ListViewModel(cfg);
         // remove last item
         model.getItems().removeAt(0);
         assert.equal(null, model.getMarkedKey()); //marker must be null
      });

      it('Selection', function() {
         var cfg = {
            items: data,
            keyProperty: 'id',
            displayProperty: 'title',
            markerVisibility: 'visible',
            markedKey: 2
         };

         var iv = new lists.ListViewModel(cfg);
         var marItem = iv.getMarkedItem();
         assert.equal(iv._display.at(1), marItem, 'Incorrect selectedItem');
         assert.equal(iv._markedKey, 2, 'Incorrect _markedKey value');


         iv.setMarkedKey(3);
         marItem = iv.getMarkedItem();
         assert.equal(2, iv._options.markedKey, 'Incorrect markedKey option value');
         assert.equal(iv._markedKey, 3, 'Incorrect _markedKey value');
         assert.equal(iv._display.at(2), marItem, 'Incorrect selectedItem');
         assert.equal(1, iv.getVersion(), 'Incorrect version appendItems');
      });

      it('markerVisibility', function() {
         var
            cfg = {
               keyProperty: 'id',
               markerVisibility: 'visible',
               markedKey: null
            },
            listModel = new lists.ListViewModel(cfg),
            markedKeyChangedFired = false;

         listModel.subscribe('onMarkedKeyChanged', function(e, key) {
            assert.equal(key, 1);
            markedKeyChangedFired = true;
         });
         listModel.setItems(new collection.RecordSet({rawData: data, keyProperty: 'id'}));
         assert.equal(listModel._markedKey, 1, 'Incorrect _markedKey value after setItems.');
         assert.equal(listModel.getMarkedItem(), listModel._display.at(0), 'Incorrect _markedItem after setItems.');
         assert.isTrue(markedKeyChangedFired, 'onMarkedKeyChanged event should fire after setItems');
      });

      it('setItemActions should not change actions if an item does not exist in display', function() {
         var
            cfg = {
               keyProperty: 'id',
               markerVisibility: 'visible',
               markedKey: null
            },
            listModel = new lists.ListViewModel(cfg),
            editingItem = {key: 'test'};

         listModel.setItemActions(new entity.Record({
            rawData: {
               id: 'test',
               title: 'test'
            },
            keyProperty: 'id'
         }), {
            all: [],
            showed: []
         });
         assert.equal(0, Object.keys(listModel._actions).length);

         listModel._editingItemData = editingItem;
         listModel.setItemActions(new entity.Record({
            rawData: {
               id: 'test',
               title: 'test'
            },
            keyProperty: 'id'
         }), {
            all: [],
            showed: []
         });
         assert.isFalse(editingItem.drawActions, "shoud not draw actions on editing item if actions array is empty");
         listModel.setItemActions(new entity.Record({
            rawData: {
               id: 'test',
               title: 'test'
            },
            idProperty: 'id'
         }), {
            all: [1,2,3],
            showed: [1,2,3]
         });
         assert.isTrue(editingItem.drawActions, "shoud draw actions on editing item if actions array is not empty");
         listModel.setEditingConfig({
            toolbarVisibility: true
         });
         listModel.setItemActions(new entity.Record({
            rawData: {
               id: 'test',
               title: 'test'
            },
            idProperty: 'id'
         }), {
            all: [],
            showed: []
         });
         assert.isTrue(editingItem.drawActions, 'should draw actions on editing item if actions array is empty and toolbarVisibility = true');
      });

      it('Clear itemActions for removed items', function() {
         var
            cfg = {
               keyProperty: 'id',
               markerVisibility: 'visible',
               markedKey: null,
               items: new collection.RecordSet({
                  rawData: data,
                  keyProperty: 'id'
               })
            },
            listModel = new lists.ListViewModel(cfg);

         listModel.setItemActions(cfg.items.at(0), {
            all: [{ id: 1, icon: 'testIcon' }],
            showed: []
         });
         assert.equal(1, Object.keys(listModel._actions).length);
         listModel.getItems().removeAt(0);
         assert.equal(0, Object.keys(listModel._actions).length);
      });

      it('_updateSelection', function() {
         var cfg = {
            items: data,
            keyProperty: 'id',
            displayProperty: 'title',
            selectedKeys: [1],
            markedKey: null
         };

         var iv = new lists.ListViewModel(cfg);
         assert.deepEqual(iv._selectedKeys, [1]);
         var curPrefixItemVersion = iv._prefixItemVersion;
         iv.updateSelection([2, 3]);
         assert.deepEqual(iv._selectedKeys, [2, 3]);
         assert.equal(iv._prefixItemVersion, curPrefixItemVersion);
      });

      it('setMultiSelectVisibility', function() {
         var cfg = {
            items: data,
            multiSelectVisibility: 'hidden'
         };
         var iv = new lists.ListViewModel(cfg);
         var curPrefixItemVersion = iv._prefixItemVersion;
         iv.setMultiSelectVisibility('visible');
         assert.equal(iv._prefixItemVersion, curPrefixItemVersion);
      });

      it('setSwipeItem', function() {
         var
            cfg = {
               items: data,
               keyProperty: 'id',
               displayProperty: 'title',
               selectedKeys: [1],
               markedKey: null
            },
            itemData = {
               test: 'test'
            },
            nextVersionCalled = false;

         var lv = new lists.ListViewModel(cfg);
         var prefixItemVersion = lv._prefixItemVersion;
         lv._nextVersion = function() {
            nextVersionCalled = true;
         };
         lv.setSwipeItem(itemData);
         assert.equal(lv._swipeItem, itemData);
         assert.isTrue(nextVersionCalled, 'setSwipeItem should change version of the model');
         assert.strictEqual(lv._prefixItemVersion, prefixItemVersion, 'setSwipeItem should not change prefix item version');
      });

      it('setSwipeItem should only change version once if called with the same item multiple times in a row', function() {
         var
            cfg = {
               items: data,
               keyProperty: 'id',
               displayProperty: 'title',
               selectedKeys: [1],
               markedKey: null
            },
            itemData = {
               test: 'test'
            },
            lv = new lists.ListViewModel(cfg);

         lv.setSwipeItem(itemData);
         lv.setSwipeItem(itemData);

         assert.equal(lv._swipeItem, itemData);
         assert.equal(1, lv.getVersion());
      });

      it('getMarkedKey', function() {
         var
            cfg = {
               items: data,
               keyProperty: 'id',
               displayProperty: 'title',
               markerVisibility: 'visible',
               markedKey: 1
            };
         var lv = new lists.ListViewModel(cfg);
         assert.equal(lv.getMarkedKey(), 1);
      });

      it('setRightSwipedItem', function() {
         var
            cfg = {
               items: data,
               keyProperty: 'id',
               displayProperty: 'title',
               selectedKeys: [1],
               markedKey: null
            },
            itemData = {
               test: 'test'
            },
            nextVersionCalled = false;

         var lv = new lists.ListViewModel(cfg);
         lv._nextVersion = function() {
            nextVersionCalled = true;
         };
         lv.setRightSwipedItem(itemData);
         assert.equal(lv._rightSwipedItem, itemData);
         assert.isTrue(nextVersionCalled, 'setRightSwipedItem should change the version of the model');
      });

      it('setActiveItem should not change version of the model if the item is already active', function() {
         var
            cfg = {
               items: data,
               keyProperty: 'id',
               displayProperty: 'title',
               selectedKeys: [1],
               markedKey: null
            },
            lv = new lists.ListViewModel(cfg),
            itemData,
            version;
         itemData = lv.getCurrent();
         lv.setActiveItem(itemData);
         version = lv.getVersion();
         lv.setActiveItem(itemData);
         assert.equal(version, lv.getVersion());
      });

      describe('DragNDrop methods', function() {
         var dragItemData, dragEntity, target, lvm, current;

         beforeEach(function() {
            dragItemData = {};
            dragEntity = {
               items: [2, 3],
               getItems: function() {
                  return this.items;
               }
            };
            target = { index: 1, key: 2, position: 'after' };
            lvm = new lists.ListViewModel({
               items: new collection.RecordSet({
                  rawData: data,
                  keyProperty: 'id'
               }),
               keyProperty: 'id',
               markedKey: null
            });
         });

         it('getItemDataByItem', function() {
            var item = lvm.getItemDataByItem(lvm.getItemById('2', 'id'));

            assert.isUndefined(item.draggingItemData);
            assert.isUndefined(item.dragTargetPosition);
            assert.isUndefined(item.isDragging);

            lvm.setDragEntity(dragEntity);
            item = lvm.getItemDataByItem(lvm.getItemById('2', 'id'));
            assert.isTrue(item.isDragging);
            assert.isTrue(item.isVisible);
            assert.isFalse(item.hasMultiSelect);
            item = lvm.getItemDataByItem(lvm.getItemById('3', 'id'));
            assert.isUndefined(item.isDragging);
            assert.isFalse(item.isVisible);
            item = lvm.getItemDataByItem(lvm.getItemById('1', 'id'));
            assert.isUndefined(item.isDragging);
            assert.isUndefined(item.isVisible);
            lvm.setItemActions(lvm.getItemById('2', 'id').getContents(), {
               all: [1, 2],
               showed: [1]
            });
            item = lvm.getItemDataByItem(lvm.getItemById('2', 'id'));
            assert.isTrue(!!item.drawActions);
         });

         it('getMultiSelectClassList hidden', function() {
            lvm._options.multiSelectVisibility = 'hidden';
            var item = lvm.getItemDataByItem(lvm.getItemById('2', 'id'));
            assert.equal(item.multiSelectClassList, '');
         });


         it('getMultiSelectClassList visible', function() {
            lvm._options.multiSelectVisibility = 'visible';
            var item = lvm.getItemDataByItem(lvm.getItemById('2', 'id'));
            assert.equal(item.multiSelectClassList, 'js-controls-ListView__checkbox js-controls-ListView__notEditable');
         });


         it('getMultiSelectClassList onhover selected', function() {
            lvm._options.multiSelectVisibility = 'onhover';
            lvm._selectedKeys = {'2': true};
            var item = lvm.getItemDataByItem(lvm.getItemById('2', 'id'));
            assert.equal(item.multiSelectClassList, 'js-controls-ListView__checkbox js-controls-ListView__notEditable');
         });

         it('getMultiSelectClassList onhover unselected', function() {
            lvm._options.multiSelectVisibility = 'onhover';
            var item = lvm.getItemDataByItem(lvm.getItemById('2', 'id'));
            assert.equal(item.multiSelectClassList, 'js-controls-ListView__checkbox js-controls-ListView__notEditable controls-ListView__checkbox-onhover');
         });

         it('setDragTargetPosition', function() {
            assert.equal(lvm.getDragTargetPosition(), null);
            lvm.setDragTargetPosition(target);
            assert.equal(lvm.getDragTargetPosition(), target);
            lvm.setDragTargetPosition(null);
            assert.equal(lvm.getDragTargetPosition(), null);
         });

         it('setDragEntity', function() {
            assert.equal(lvm.getDragEntity(), null);
            lvm.setDragEntity(dragEntity);
            assert.equal(lvm.getDragEntity(), dragEntity);
            lvm.setDragEntity(null);
            assert.equal(lvm.getDragEntity(), null);
         });

         it('setDragItemData', function() {
            assert.equal(lvm.getDragItemData(), null);
            lvm.setDragItemData(dragItemData);
            assert.equal(lvm.getDragItemData(), dragItemData);
            lvm.setDragItemData(null);
            assert.equal(lvm.getDragItemData(), null);
         });

         describe('getItemDataByItem', function() {
            it('without dragNDrop', function() {
               current = lvm.getItemDataByItem(lvm.at(1));
               assert.equal(current.isDragging, undefined);
               assert.equal(current.isVisible, undefined);
               assert.equal(current.dragTargetPosition, undefined);
               assert.equal(current.draggingItemData, undefined);
            });

            it('without dragTarget and dragEntity', function() {
               lvm.setDragItemData(lvm.getItemDataByItem(lvm.at(1)));
               lvm.setDragEntity(dragEntity);

               current = lvm.getItemDataByItem(lvm.at(1));
               assert.equal(current.isDragging, true);
               assert.equal(current.isVisible, true);
               assert.equal(current.dragTargetPosition, undefined);
               assert.equal(current.draggingItemData, undefined);
            });

            it('without dragItemData', function() {
               lvm.setDragEntity(dragEntity);
               lvm.setDragTargetPosition(lvm.calculateDragTargetPosition(lvm.getItemDataByItem(lvm.at(0))));

               current = lvm.getItemDataByItem(lvm.at(0));
               assert.isUndefined(current.dragTargetPosition);
               assert.isUndefined(current.draggingItemData);
            });

            it('without dragTarget', function() {
               lvm.setDragItemData(lvm.getItemDataByItem(lvm.at(1)));
               lvm.setDragEntity(dragEntity);

               current = lvm.getItemDataByItem(lvm.at(1));
               assert.equal(current.isDragging, true);
               assert.equal(current.isVisible, true);
               assert.equal(current.dragTargetPosition, undefined);
               assert.equal(current.draggingItemData, undefined);
               current = lvm.getItemDataByItem(lvm.at(2));
               assert.equal(current.isVisible, false);
            });

            it('with dragTarget', function() {
               dragItemData = lvm.getItemDataByItem(lvm.at(1));
               lvm.setDragItemData(dragItemData);
               lvm.setDragEntity(dragEntity);

               // move up
               lvm.setDragTargetPosition(lvm.calculateDragTargetPosition(lvm.getItemDataByItem(lvm.at(0))));
               current = lvm.getItemDataByItem(lvm.at(0));
               assert.equal(current.dragTargetPosition, 'before');
               assert.equal(current.draggingItemData, dragItemData);

               // move down
               lvm.setDragTargetPosition(lvm.calculateDragTargetPosition(lvm.getItemDataByItem(lvm.at(2))));
               current = lvm.getItemDataByItem(lvm.at(2));
               assert.equal(current.dragTargetPosition, 'after');
               assert.equal(current.draggingItemData, dragItemData);
            });
            it('getSpacingClassList', function() {
               assert.equal(lists.ListViewModel._private.getSpacingClassList({
                  itemPadding: {
                     left: 'm',
                     right: 'XS'
                  },
                  multiSelectVisibility: 'hidden'
               }), ' controls-ListView__itemContent controls-ListView__item-topPadding_default controls-ListView__item-bottomPadding_default' +
                  ' controls-ListView__item-rightPadding_xs controls-ListView__item-leftPadding_m');
               assert.equal(lists.ListViewModel._private.getSpacingClassList({
                  itemPadding: {
                     left: 'XS',
                     right: 'm',
                     top: 'null',
                     bottom: 's'
                  },
                  multiSelectVisibility: 'visible'
               }), ' controls-ListView__itemContent controls-ListView__item-topPadding_null controls-ListView__item-bottomPadding_s' +
                  ' controls-ListView__item-rightPadding_m controls-ListView__itemContent_withCheckboxes');
            });

            it('check search value', function() {
               lvm.setSearchValue('test');
               assert.equal(lvm.getItemDataByItem(lvm._display.at(0)).searchValue, 'test');
               lvm.setSearchValue(null);
            });
         });

         describe('calculateDragTargetPosition', function() {
            var
               itemData,
               dragItemData,
               dragTargetPosition;

            it('without setDragTargetPosition and without setDragItemData', function() {
               itemData = lvm.getItemDataByItem(lvm.at(1));
               dragTargetPosition = lvm.calculateDragTargetPosition(itemData);
               assert.equal(dragTargetPosition.index, itemData.index);
               assert.equal(dragTargetPosition.position, 'before');
            });

            it('without setDragTargetPosition', function() {
               dragItemData = lvm.getItemDataByItem(lvm.at(1));
               lvm.setDragItemData(dragItemData);
               lvm.setDragEntity(dragEntity);

               // before dragItemData
               itemData = lvm.getItemDataByItem(lvm.at(0));
               dragTargetPosition = lvm.calculateDragTargetPosition(itemData);
               assert.equal(dragTargetPosition.index, itemData.index);
               assert.equal(dragTargetPosition.position, 'before');

               // after dragItemData
               itemData = lvm.getItemDataByItem(lvm.at(2));
               dragTargetPosition = lvm.calculateDragTargetPosition(itemData);
               assert.equal(dragTargetPosition.index, itemData.index);
               assert.equal(dragTargetPosition.position, 'after');

               // on dragItemData
               itemData = lvm.getItemDataByItem(lvm.at(1));
               dragTargetPosition = lvm.calculateDragTargetPosition(itemData);
               assert.isNull(dragTargetPosition);
            });

            it('with setDragTargetPosition', function() {
               itemData = lvm.getItemDataByItem(lvm.at(1));
               dragTargetPosition = lvm.calculateDragTargetPosition(itemData);
               lvm.setDragTargetPosition(dragTargetPosition);

               // move up
               itemData = lvm.getItemDataByItem(lvm.at(0));
               dragTargetPosition = lvm.calculateDragTargetPosition(itemData);
               assert.equal(dragTargetPosition.index, itemData.index);
               assert.equal(dragTargetPosition.position, 'before');

               // move down
               itemData = lvm.getItemDataByItem(lvm.at(1));
               dragTargetPosition = lvm.calculateDragTargetPosition(itemData);
               assert.equal(dragTargetPosition.index, itemData.index);
               assert.equal(dragTargetPosition.position, 'after');
            });
            it('_calcCursorClasses', function() {
               var
                  cfg = {
                     items: new collection.RecordSet({
                        rawData: data,
                        keyProperty: 'id'
                     }),
                     keyProperty: 'id',
                     displayProperty: 'title'
                  },
                  model = new lists.ListViewModel(cfg);
               assert.equal(' controls-ListView__itemV controls-ListView__itemV_cursor-default', model._calcCursorClasses(false, 'default'));
               assert.equal(' controls-ListView__itemV controls-ListView__itemV_cursor-pointer', model._calcCursorClasses(true, 'pointer'));
               assert.equal(' controls-ListView__itemV controls-ListView__itemV_cursor-pointer', model._calcCursorClasses());
            })
         });
      });
   });
});
