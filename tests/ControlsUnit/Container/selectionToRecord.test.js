define(
   [
      'Controls/operations',
      'Types/source'
   ],
   function(operations, sourceLib) {
      'use strict';

      describe('Controls.Container.MultiSelector.selectionToRecord', function() {

         it ('selectionToRecord', function() {
            var source = new sourceLib.Memory();
            var selectionType;
            var selection;
            var selectionRec;

            selection = {
               selected: ['1', '2'],
               excluded: ['1', '2']
            };
            selectionType = 'leaf';

            selectionRec = operations.selectionToRecord(selection, source.getAdapter(), selectionType);
            assert.deepEqual(selectionRec.get('excluded'), ['1', '2']);
            assert.deepEqual(selectionRec.get('marked'), ['1', '2']);
            assert.equal(selectionRec.get('type'), 'leaf');
            assert.equal(selectionRec.getFormat().at(0).getKind(), 'string');
            assert.isTrue(selectionRec.get('recursive'));

            selection = {
               selected: ['2'],
               excluded: ['2']
            };
            selectionType = 'node';

            selectionRec = operations.selectionToRecord(selection, source.getAdapter(), selectionType, false);
            assert.deepEqual(selectionRec.get('excluded'), ['2']);
            assert.deepEqual(selectionRec.get('marked'), ['2']);
            assert.equal(selectionRec.get('type'), 'node');
            assert.isFalse(selectionRec.get('recursive'));

            selectionType = undefined;
            selectionRec = operations.selectionToRecord(selection, source.getAdapter(), selectionType);
            assert.equal(selectionRec.get('type'), 'all');
            assert.isTrue(selectionRec.get('recursive'));
         });

      });
   }
);
