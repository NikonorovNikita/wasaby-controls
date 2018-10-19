define([
   'Controls/List/TreeControl',
   'Core/Deferred',
   'Core/core-instance',
   'WS.Data/Collection/RecordSet'
], function(
   TreeControl,
   Deferred,
   cInstance,
   RecordSet
) {
   describe('Controls.List.TreeControl', function() {
      it('TreeControl.reload', function() {
         var
            treeControl = new TreeControl({}),
            isSourceControllerDestroyed = false;
         treeControl._children = {
            baseControl: {
               reload: function() {},
               getViewModel: function() {
                  return {
                     setHasMoreStorage: function() {}
                  };
               }
            }
         };
         treeControl._nodesSourceControllers = {
            1: {
               destroy: function() {
                  isSourceControllerDestroyed = true;
               }
            }
         };
         treeControl.reload();
         assert.deepEqual({}, treeControl._nodesSourceControllers, 'Invalid value "_nodesSourceControllers" after call "treeControl.reload()".');
         assert.isTrue(isSourceControllerDestroyed, 'Invalid value "isSourceControllerDestroyed" after call "treeControl.reload()".');
      });
      it('TreeControl._beforeUpdate', function() {
         var
            reloadCalled = false,
            setRootCalled = false,
            opts = { parentProperty: 'parent' },
            treeControl = new TreeControl(opts);
         treeControl.saveOptions(opts);
         treeControl._children = {
            baseControl: {
               reload: function(filter) {
                  reloadCalled = true;
                  assert.equal(filter['parent'], 'testRoot', 'Invalid value "filter[parentProperty]" after call "_beforeUpdate" with new "root"');
               },
               getViewModel: function() {
                  return {
                     setHasMoreStorage: function() {},
                     setRoot: function() {
                        setRootCalled = true;
                     }
                  };
               }
            }
         };
         treeControl._beforeUpdate({ root: 'testRoot' });
         treeControl._afterUpdate({ root: '' });
         assert.isTrue(reloadCalled, 'Invalid call "reload" after call "_beforeUpdate" and apply new "root".');
         assert.isTrue(setRootCalled, 'Invalid call "setRoot" after call "_beforeUpdate" and apply new "root".');
      });
      it('TreeControl._private.prepareHasMoreStorage', function() {
         var
            sourceControllers = {
               1: {
                  hasMoreData: function() {
                     return true;
                  }
               },
               2: {
                  hasMoreData: function() {
                     return false;
                  }
               }
            },
            hasMoreResult = {
               1: true,
               2: false
            };
         assert.deepEqual(hasMoreResult, TreeControl._private.prepareHasMoreStorage(sourceControllers),
            'Invalid value returned from "prepareHasMoreStorage(sourceControllers)".');
      });
      it('TreeControl._private.loadMore', function() {
         var
            setHasMoreCalled = false,
            mergeItemsCalled = false,
            mockedTreeControlInstance = {
               _options: {
                  filter: {
                     testParam: 11101989
                  },
                  parentProperty: 'parent',
                  uniqueKeys: true
               },
               _nodesSourceControllers: {
                  1: {
                     load: function() {
                        var
                           result = new Deferred();
                        result.callback();
                        return result;
                     },
                     hasMoreData: function() {
                        return true;
                     }
                  }
               },
               _children: {
                  baseControl: {
                     getViewModel: function() {
                        return {
                           setHasMoreStorage: function() {
                              setHasMoreCalled = true;
                           },
                           mergeItems: function() {
                              mergeItemsCalled = true;
                           }
                        };
                     }
                  }
               }
            },
            dispItem = {
               getContents: function() {
                  return {
                     getId: function() {
                        return 1;
                     }
                  };
               }
            };
         TreeControl._private.loadMore(mockedTreeControlInstance, dispItem);
         assert.deepEqual({
            testParam: 11101989
         }, mockedTreeControlInstance._options.filter,
         'Invalid value "filter" after call "TreeControl._private.loadMore(...)".');
         assert.isTrue(setHasMoreCalled, 'Invalid call "setHasMore" by "TreeControl._private.loadMore(...)".');
         assert.isTrue(mergeItemsCalled, 'Invalid call "mergeItemsCalled" by "TreeControl._private.loadMore(...)".');
      });
      describe('EditInPlace', function() {
         it('beginEdit', function() {
            var opt = {
               test: '123'
            };
            var
               treeControl = new TreeControl({});
            treeControl._children = {
               baseControl: {
                  beginEdit: function(options) {
                     assert.equal(opt, options);
                     return Deferred.success();
                  }
               }
            };
            var result = treeControl.beginEdit(opt);
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isTrue(result.isSuccessful());
         });

         it('beginEdit, readOnly: true', function() {
            var opt = {
               test: '123'
            };
            var
               treeControl = new TreeControl({});
            treeControl.saveOptions({ readOnly: true });
            var result = treeControl.beginEdit(opt);
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isFalse(result.isSuccessful());
         });

         it('beginAdd', function() {
            var opt = {
               test: '123'
            };
            var
               treeControl = new TreeControl({});
            treeControl._children = {
               baseControl: {
                  beginAdd: function(options) {
                     assert.equal(opt, options);
                     return Deferred.success();
                  }
               }
            };
            var result = treeControl.beginAdd(opt);
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isTrue(result.isSuccessful());
         });

         it('beginAdd, readOnly: true', function() {
            var opt = {
               test: '123'
            };
            var
               treeControl = new TreeControl({});
            treeControl.saveOptions({ readOnly: true });
            var result = treeControl.beginAdd(opt);
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isFalse(result.isSuccessful());
         });
         it('cancelEdit', function() {
            var
               treeControl = new TreeControl({});
            treeControl._children = {
               baseControl: {
                  cancelEdit: function() {
                     return Deferred.success();
                  }
               }
            };
            var result = treeControl.cancelEdit();
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isTrue(result.isSuccessful());
         });

         it('cancelEdit, readOnly: true', function() {
            var
               treeControl = new TreeControl({});
            treeControl.saveOptions({ readOnly: true });
            var result = treeControl.cancelEdit();
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isFalse(result.isSuccessful());
         });

         it('commitEdit', function() {
            var
               treeControl = new TreeControl({});
            treeControl._children = {
               baseControl: {
                  commitEdit: function() {
                     return Deferred.success();
                  }
               }
            };
            var result = treeControl.commitEdit();
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isTrue(result.isSuccessful());
         });

         it('commitEdit, readOnly: true', function() {
            var
               treeControl = new TreeControl({});
            treeControl.saveOptions({ readOnly: true });
            var result = treeControl.commitEdit();
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isFalse(result.isSuccessful());
         });
      });
      it('TreeControl._onNodeRemoved', function() {
         var
            treeControl = new TreeControl({});

         treeControl._nodesSourceControllers = {
            1: {
               destroy: function() {}
            },
            2: {},
            3: {}
         };
         treeControl._onNodeRemoved(null, 1);
         assert.deepEqual({ 2: {}, 3: {} }, treeControl._nodesSourceControllers, 'Incorrect value "_nodesSourceControllers" after call "treeControl._onNodeRemoved(null, 1)".');
      });
      describe('_onCheckBoxClick', function() {
         it('select', function() {
            var
               treeControl = new TreeControl({}),
               cfg = {
                  selectedKeys: [1, 2, 3]
               };
            treeControl.saveOptions(cfg);
            treeControl._notify = function(eventName, eventArgs) {
               assert.equal(eventName, 'selectedKeysChanged');
               assert.deepEqual(eventArgs[0], [1, 2, 3, 4]);
               assert.deepEqual(eventArgs[1], [4]);
               assert.deepEqual(eventArgs[2], []);
            };
            treeControl._onCheckBoxClick({}, 4, false);
         });
         it('unselect all children', function() {
            var
               treeControl = new TreeControl({}),
               cfg = {
                  selectedKeys: [1, 2, 3],
                  parentProperty: 'parent',
                  nodeProperty: 'parent@',
                  keyProperty: 'id',
                  items: new RecordSet({
                     idProperty: 'id',
                     rawData: [{
                        id: 1,
                        'parent': null,
                        'parent@': true
                     }, {
                        id: 2,
                        'parent': 1,
                        'parent@': false
                     }, {
                        id: 3,
                        'parent': 1,
                        'parent@': false
                     }]
                  })
               };
            treeControl.saveOptions(cfg);
            treeControl._beforeMount(cfg);
            treeControl._notify = function(eventName, eventArgs) {
               assert.equal(eventName, 'selectedKeysChanged');
               assert.deepEqual(eventArgs[0], [1, 3]);
               assert.deepEqual(eventArgs[1], []);
               assert.deepEqual(eventArgs[2], [2]);
            };
            treeControl._onCheckBoxClick({}, 2, true);
            treeControl._options.selectedKeys = [1, 3];
            treeControl._notify = function(eventName, eventArgs) {
               assert.equal(eventName, 'selectedKeysChanged');
               assert.deepEqual(eventArgs[0], []);
               assert.deepEqual(eventArgs[1], []);
               assert.deepEqual(eventArgs[2], [1, 3]);
            };
            treeControl._onCheckBoxClick({}, 3, true);
         });
         it('unselect folder', function() {
            var
               treeControl = new TreeControl({}),
               cfg = {
                  selectedKeys: [1, 2, 3],
                  parentProperty: 'parent',
                  nodeProperty: 'parent@',
                  keyProperty: 'id',
                  items: new RecordSet({
                     idProperty: 'id',
                     rawData: [{
                        id: 1,
                        'parent': null,
                        'parent@': true
                     }, {
                        id: 2,
                        'parent': 1,
                        'parent@': true
                     }, {
                        id: 3,
                        'parent': 2,
                        'parent@': false
                     }]
                  })
               };
            treeControl.saveOptions(cfg);
            treeControl._beforeMount(cfg);
            treeControl._notify = function(eventName, eventArgs) {
               assert.equal(eventName, 'selectedKeysChanged');
               assert.deepEqual(eventArgs[0], []);
               assert.deepEqual(eventArgs[1], []);
               assert.deepEqual(eventArgs[2], [1, 2, 3]);
            };
            treeControl._onCheckBoxClick({}, 1, true);
         });
         it('unselect child while inside a folder (so folder doesn\'t exist in items)', function() {
            var
               treeControl = new TreeControl({}),
               cfg = {
                  selectedKeys: [1, 2, 3],
                  parentProperty: 'parent',
                  nodeProperty: 'parent@',
                  keyProperty: 'id',
                  items: new RecordSet({
                     idProperty: 'id',
                     rawData: [{
                        id: 2,
                        'parent': 1,
                        'parent@': false
                     }, {
                        id: 3,
                        'parent': 1,
                        'parent@': false
                     }]
                  })
               };
            treeControl.saveOptions(cfg);
            treeControl._beforeMount(cfg);
            treeControl._notify = function(eventName, eventArgs) {
               assert.equal(eventName, 'selectedKeysChanged');
               assert.deepEqual(eventArgs[0], [1, 3]);
               assert.deepEqual(eventArgs[1], []);
               assert.deepEqual(eventArgs[2], [2]);
            };
            treeControl._onCheckBoxClick({}, 2, true);
         });
      });
   });
});
