import {ControllerClass} from 'Controls/search';
import {assert} from 'chai';
import {NewSourceController as SourceController} from 'Controls/dataSource';
import {Memory, QueryWhereExpression} from 'Types/source';
import {createSandbox, SinonSpy} from 'sinon';
import {IControllerOptions} from 'Controls/_dataSource/Controller';

const getMemorySource = (): Memory => {
   return new Memory({
      data: [
         {
            id: 0,
            title: 'test'
         },
         {
            id: 1,
            title: 'test1'
         },
         {
            id: 2,
            title: 'test'
         },
         {
            id: 3,
            title: 'test2'
         }
      ]
   });
};

const getSourceController = (options: Partial<IControllerOptions>) => {
   return new SourceController({
      dataLoadErrback: () => null,
      parentProperty: null,
      root: null,
      sorting: [],
      filter: {},
      keyProperty: 'id',
      source: getMemorySource(),
      navigation: {
         source: 'page',
         sourceConfig: {
            pageSize: 2,
            page: 0,
            hasMore: false
         }
      },
      ...options
   });
};

const defaultOptionsControllerClass = {
   minSearchLength: 3,
   searchDelay: 50,
   searchParam: 'testParam',
   searchValue: '',
   searchValueTrim: false,
   sourceController: getSourceController({})
};

const getControllerClass = (options) => {
   return new ControllerClass({
      ...defaultOptionsControllerClass,
      ...options
   });
};

describe('Controls/search:ControllerClass', () => {
   const sandbox = createSandbox();

   let sourceController: SourceController;
   let controllerClass: ControllerClass;
   let getFilterSpy: SinonSpy;

   beforeEach(() => {
      sourceController = getSourceController({});
      controllerClass = getControllerClass({
         sourceController
      });
      getFilterSpy = sandbox.spy(sourceController, 'setFilter');
   });

   afterEach(() => {
      sandbox.reset();
   });

   after(() => sandbox.restore());

   it('search method', () => {
      const filter: QueryWhereExpression<unknown> = {
         testParam: 'testValue'
      };
      controllerClass.search('testValue');

      assert.isTrue(getFilterSpy.withArgs(filter).called);
   });

   describe('with hierarchy', () => {
      it('default search case and reset', () => {
         const filter: QueryWhereExpression<unknown> = {
            testParam: 'testValue',
            testParent: 'testRoot',
            'Разворот': 'С разворотом',
            'usePages': 'full'
         };
         controllerClass._options.parentProperty = 'testParent';
         controllerClass._root = 'testRoot';
         controllerClass._options.startingWith = 'current';

         controllerClass.search('testValue');

         assert.isTrue(getFilterSpy.withArgs(filter).called);
         getFilterSpy.resetHistory();

         controllerClass.reset();
         assert.isTrue(getFilterSpy.withArgs({
            testParam: ''
         }).called);
      });

      it('without parent property', () => {
         const filter: QueryWhereExpression<unknown> = {
            testParam: 'testValue'
         };
         controllerClass._root = 'testRoot';
         controllerClass._options.startingWith = 'current';

         controllerClass.search('testValue');

         assert.isTrue(getFilterSpy.withArgs(filter).called);
         getFilterSpy.resetHistory();

         controllerClass.reset();
         assert.isTrue(getFilterSpy.withArgs({
            testParam: ''
         }).called);
      });
   });

   it('search and reset', () => {
      const filter: QueryWhereExpression<unknown> = {
         testParam: 'testValue'
      };
      controllerClass.search('testValue');

      assert.isTrue(getFilterSpy.withArgs(filter).called);

      controllerClass.reset();

      assert.isTrue(getFilterSpy.withArgs({
         testParam: ''
      }).called);
   });

   it('search and update', () => {
      const filter: QueryWhereExpression<unknown> = {
         testParam: 'testValue'
      };
      const updatedFilter: QueryWhereExpression<unknown> = {
         testParam: 'updatedValue'
      };
      controllerClass.search('testValue');

      assert.isTrue(getFilterSpy.withArgs(filter).called);

      controllerClass.update({
         searchValue: 'updatedValue',
         root: 'newRoot'
      });

      assert.isTrue(getFilterSpy.withArgs(updatedFilter).called);
      assert.equal(controllerClass._root, 'newRoot');
   });
});
