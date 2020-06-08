define([
   'Core/core-instance',
   'Controls/dateRange',
   'Types/entity'
], function(
   cInstance,
   dateRange,
   typesEntity
) {
   'use strict';

   describe('Controls/dateRange:DateRangeModel', function() {
      describe('.update', function() {

         it('should update [start|end]Value fields', function() {
            let model = new dateRange.DateRangeModel(),
               options = {
                  startValue: new Date(2018, 0, 1),
                  endValue: new Date(2018, 0, 3)
               };

            model.update(options);

            assert.strictEqual(model.startValue, options.startValue);
            assert.strictEqual(model.endValue, options.endValue);
         });

         it('should not update [start|end]Value fields if they were not updated from the outside', function() {
            let
               model = new dateRange.DateRangeModel(),
               startValue = new Date(2018, 0, 1),
               endValue = new Date(2018, 0, 3);

            model.setRange(startValue, endValue);
            model.update({});

            assert.strictEqual(model.startValue, startValue);
            assert.strictEqual(model.endValue, endValue);
         });
      });

      ['startValue', 'endValue'].forEach(function(field) {
         describe(`.${field}`, function() {
            it(`should update ${field} if value changed`, function() {
               let model = new dateRange.DateRangeModel(),
                  value = new Date(2018, 0, 1),
                  callback = sinon.spy(),
                  rangeChangedCallback = sinon.spy(),
                  valueChangedCallback = sinon.spy();

               model.subscribe(`${field}Changed`, callback);
               model.subscribe('rangeChanged', rangeChangedCallback);
               model.subscribe('valueChanged', valueChangedCallback);
               model[field] = value;

               assert.strictEqual(model[field], value);
               assert(callback.calledOnce, `${field}Changed callback called ${callback.callCount} times`);
               assert(rangeChangedCallback.calledOnce, `rangeChangedCallback callback called ${callback.callCount} times`);
               assert(valueChangedCallback.calledOnce, `valueChangedCallback callback called ${callback.callCount} times`);
            });

            it(`should not update ${field} if value did not changed`, function() {
               let model = new dateRange.DateRangeModel(),
                  value = new Date(2018, 0, 1),
                  callback = sinon.spy(),
                  rangeChangedCallback = sinon.spy(),
                  valueChangedCallback = sinon.spy(),
                  options = {};

               options[field] = value;
               model.update(options);

               model.subscribe(`${field}Changed`, callback);
               model.subscribe('rangeChanged', rangeChangedCallback);
               model.subscribe('valueChanged', valueChangedCallback);
               model[field] = value;

               assert.strictEqual(model[field], value);
               assert(callback.notCalled, `${field}Changed callback called ${callback.callCount} times`);
               assert(rangeChangedCallback.notCalled, `rangeChangedCallback callback called ${callback.callCount} times`);
               assert(valueChangedCallback.notCalled, `valueChangedCallback callback called ${callback.callCount} times`);
            });
         });
      });

      describe('.shiftForward', function() {
         [
            {
               start: new Date(2018, 0, 1),
               end: new Date(2018, 0, 31),
               rStart: new Date(2018, 1, 1),
               rEnd: new Date(2018, 1, 28)
            }, {
               start: new Date(2018, 0, 1),
               end: new Date(2018, 2, 31),
               rStart: new Date(2018, 3, 1),
               rEnd: new Date(2018, 5, 30)
            }, {
               start: new Date(2018, 0, 1),
               end: new Date(2018, 5, 30),
               rStart: new Date(2018, 6, 1),
               rEnd: new Date(2018, 11, 31)
            }
         ].forEach(function(test) {
            it('should shift period forward', function() {
               let model = new dateRange.DateRangeModel();

               model.update({ startValue: test.start, endValue: test.end });
               model.shiftForward();

               assert.equal(model.startValue.getTime(), test.rStart.getTime());
               cInstance.instanceOfModule(model.startValue, 'Types/entity:DateTime');
               assert.equal(model.endValue.getTime(), test.rEnd.getTime());
               cInstance.instanceOfModule(model.endValue, 'Types/entity:DateTime');
            });
         });
      });

      describe('.shiftBack', function() {
         [
            {
               start: new Date(2018, 0, 1),
               end: new Date(2018, 0, 31),
               rStart: new Date(2017, 11, 1),
               rEnd: new Date(2017, 11, 31)
            }, {
               start: new Date(2018, 0, 1),
               end: new Date(2018, 2, 31),
               rStart: new Date(2017, 9, 1),
               rEnd: new Date(2017, 11, 31)
            }, {
               start: new Date(2018, 0, 1),
               end: new Date(2018, 5, 30),
               rStart: new Date(2017, 6, 1),
               rEnd: new Date(2017, 11, 31)
            }
         ].forEach(function(test) {
            it('should shift period back', function() {
               let model = new dateRange.DateRangeModel();

               model.update({ startValue: test.start, endValue: test.end });
               model.shiftBack();

               assert.equal(model.startValue.getTime(), test.rStart.getTime());
               cInstance.instanceOfModule(model.startValue, 'Types/entity:DateTime');
               assert.equal(model.endValue.getTime(), test.rEnd.getTime());
               cInstance.instanceOfModule(model.endValue, 'Types/entity:DateTime');
            });
         });
      });

      describe('.setRange', function() {
         it('should make notification about changes of startValue and endValue', function(done) {
            let model = new dateRange.DateRangeModel(),
               options = {
                  startValue: new Date(2018, 0, 1),
                  endValue: new Date(2018, 0, 3)
               };
            const sandbox = sinon.sandbox.create();
            sandbox.stub(model, '_notify');
            model.setRange();
            setTimeout(function() {
               sinon.assert.calledWith(model._notify, 'rangeChanged');
               sandbox.restore();
               done();
            }, 10);
         });
      });
   });
});
