define([
   'Controls/StickyHeader/Group',
   'Controls/StickyHeader/Utils',
   'Core/core-merge'
], function(
   StickyHeader,
   stickyUtils,
   coreMerge
) {

   'use strict';

   const
      createComponent = function(Component, cfg) {
         let mv;
         if (Component.getDefaultOptions) {
            cfg = coreMerge(cfg, Component.getDefaultOptions(), {preferSource: true});
         }
         mv = new Component(cfg);
         mv.saveOptions(cfg);
         mv._beforeMount(cfg);
         return mv;
      },
      options = {
      };

   describe('Controls/StickyHeader/Group', function() {
      describe('Initialisation', function() {
         it('should set correct header id', function() {
            const component = createComponent(StickyHeader, options);
            component._afterMount();
            assert.strictEqual(component._index, stickyUtils._lastId);
         });
      });

      describe('_fixedHandler', function() {
         const
            event = { stopImmediatePropagation: sinon.fake() };

         it('should add fixed header to list of fixed headers', function() {
            const
               component = createComponent(StickyHeader, options),
               headerIdTop = stickyUtils.getNextId(),
               headerIdBottom = stickyUtils.getNextId();

            component._fixedHandler(event, { fixedPosition: 'top', id: headerIdTop });
            assert.lengthOf(component._stickyHeadersIds.top, 1);
            assert.lengthOf(component._stickyHeadersIds.bottom, 0);
            assert.include(component._stickyHeadersIds.top, headerIdTop);

            component._fixedHandler(event, { fixedPosition: 'bottom', id: headerIdBottom });
            assert.lengthOf(component._stickyHeadersIds.top, 1);
            assert.lengthOf(component._stickyHeadersIds.bottom, 1);
            assert.include(component._stickyHeadersIds.bottom, headerIdBottom);
         });

         it('should remove fixed header from list of fixed headers on header unfixed', function() {
            const
               component = createComponent(StickyHeader, options),
               headerIdTop = stickyUtils.getNextId(),
               headerIdBottom = stickyUtils.getNextId();

            component._stickyHeadersIds.top.push(headerIdTop);
            component._stickyHeadersIds.bottom.push(headerIdBottom);

            component._fixedHandler(event, { fixedPosition: '', prevPosition: 'top', id: headerIdTop });
            assert.lengthOf(component._stickyHeadersIds.top, 0);
            assert.notInclude(component._stickyHeadersIds.top, headerIdTop);

            component._fixedHandler(event, { fixedPosition: '', prevPosition: 'bottom', id: headerIdBottom });
            assert.lengthOf(component._stickyHeadersIds.bottom, 0);
            assert.notInclude(component._stickyHeadersIds.bottom, headerIdBottom);
         });

         it('should generate event on first header fixed', function() {
            const
               component = createComponent(StickyHeader, options),
               headerId = stickyUtils.getNextId();

            sinon.stub(component, '_notify');
            component._fixedHandler(event,
                { fixedPosition: 'top', prevPosition: '', id: headerId, mode: 'replaceable', offsetHeight: 10 });

            sinon.assert.calledWith(
               component._notify,
               'fixed',
               [{
                  fixedPosition: 'top',
                  id: component._index,
                  mode: 'replaceable',
                  offsetHeight: 10,
                  prevPosition: ''
               }], {
                  bubbling: true
               }
            );
            sinon.restore();
         });

         it('should not generate event on second header fixed', function() {
            const
               component = createComponent(StickyHeader, options);

            component._fixedHandler(event,
                { fixedPosition: 'top', prevPosition: '', id: stickyUtils.getNextId(), mode: 'replaceable', offsetHeight: 10 });

            sinon.stub(component, '_notify');
            component._fixedHandler(event,
                { fixedPosition: 'top', prevPosition: '', id: stickyUtils.getNextId(), mode: 'replaceable', offsetHeight: 10 });

            sinon.assert.notCalled(component._notify);
            sinon.restore();
         });

         it('should generate event on last header unfixed', function() {
            const
               component = createComponent(StickyHeader, options),
               headerId = stickyUtils.getNextId();

            component._fixedHandler(event,
                { fixedPosition: 'top', prevPosition: '', id: headerId, mode: 'replaceable', offsetHeight: 10 });

            sinon.stub(component, '_notify');
            component._fixedHandler(event,
                { fixedPosition: '', prevPosition: 'top', id: headerId, mode: 'replaceable', offsetHeight: 10 });

            sinon.assert.calledWith(
               component._notify,
               'fixed',
               [{
                  fixedPosition: '',
                  id: component._index,
                  mode: 'replaceable',
                  offsetHeight: 10,
                  prevPosition: 'top'
               }], {
                  bubbling: true
               }
            );
            sinon.restore();
         });

         it('should not generate event on not last header unfixed', function() {
            const
               component = createComponent(StickyHeader, options),
               headerId = stickyUtils.getNextId();

            component._fixedHandler(event,
                { fixedPosition: 'top', prevPosition: '', id: stickyUtils.getNextId(), mode: 'replaceable', offsetHeight: 10 });
            component._fixedHandler(event,
                { fixedPosition: 'top', prevPosition: '', id: headerId, mode: 'replaceable', offsetHeight: 10 });

            sinon.stub(component, '_notify');
            component._fixedHandler(event,
                { fixedPosition: '', prevPosition: 'top', id: headerId, mode: 'replaceable', offsetHeight: 10 });

            sinon.assert.notCalled(component._notify);
            sinon.restore();
         });
      });

      describe('_updateStickyShadow', function() {
         it('should transfer an event if the header identifier is equal to the current one', function() {
            const
               component = createComponent(StickyHeader, options);

            component._children.stickyHeaderShadow = {
               start: sinon.fake()
            };

            component._updateStickyShadow([component._index]);
            sinon.assert.called(component._children.stickyHeaderShadow.start);
         });

         it('should not transfer an event if the header identifier is not equal to the current one', function() {
            const
               component = createComponent(StickyHeader, options);

            component._children.stickyHeaderShadow = {
               start: sinon.fake()
            };

            component._updateStickyShadow([component._index + 1]);
            sinon.assert.notCalled(component._children.stickyHeaderShadow.start);
         });
      });

      describe('set bottom', function() {
         it('should update bottom on internal headers', function () {
            const component = createComponent(StickyHeader, {});
            component._headers[0] = {
               inst: {
                  top: 0
               }
            }
            component.top = 20;
            assert.strictEqual(component._headers[0].inst.top, 20);
         });
      });

      describe('set bottom', function() {
         it('should update bottom on internal headers', function () {
            const component = createComponent(StickyHeader, {});
            component._headers[0] = {
               inst: {
                  bottom: 0
               }
            }
            component.bottom = 20;
            assert.strictEqual(component._headers[0].inst.bottom, 20);
         });
      });

      describe('_stickyRegisterHandler', function() {
         it('should stopImmediatePropagation event', function() {
            const
               component = createComponent(StickyHeader, options);
            let event = {
               blockUpdate: false,
               stopImmediatePropagation: sinon.fake()
            };
            component._stickyRegisterHandler(event, { id: 2 }, true);
            sinon.assert.calledOnce(event.stopImmediatePropagation);
         });
         it('should register new header', function() {
            const
               component = createComponent(StickyHeader, options);
            let
               event = {
                  blockUpdate: false,
                  stopImmediatePropagation: sinon.fake()
               },
               param = { id: 2 };
            component._stickyRegisterHandler(event, { id: 2 }, true);
            assert.deepEqual(component._headers, { 2: param });
         });
         it('should unregister deleted header', function() {
            const
               component = createComponent(StickyHeader, options);
            let event = {
               blockUpdate: false,
               stopImmediatePropagation: sinon.fake()
            },
            id = 2;
            component._headers[id] = { id: 2 };
            component._stickyRegisterHandler(event, { id: 2 }, false);
            assert.isUndefined(component._headers[2]);
         });
      });
   });

});
