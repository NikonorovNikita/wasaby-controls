define([
   'Env/Env',
   'Controls/scroll',
   'Controls/StickyHeader/Utils',
   'Core/core-merge'
], function(
   Env,
   scroll,
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
      getRegisterObject = function(cfg) {
         return {
            id: stickyUtils.getNextId(),
            position: (cfg && cfg.position) || 'top',
            inst: {
               getOffset: function() {
                  return 0;
               },
               height: 10
            }
         }
      },
      options = {
      },
      data = {
            id: 2,
            position: 'top',
            mode: 'stackable',
            inst: {
               getOffset: function() {
                  return 0;
               },
               height: 10
            }
         };

   describe('Controls.StickyHeader.Controller', function() {
      let component, result;

      beforeEach(function() {
         component = createComponent(scroll._stickyHeaderController, {});
         component._children.stickyHeaderShadow = {
            start: sinon.fake()
         };
      });

      describe('_stickyRegisterHandler', function() {
         it('should stopImmediatePropagation event', function() {
            let event = {
               blockUpdate: false,
               stopImmediatePropagation: sinon.fake()
            };
            component._stickyRegisterHandler(event, data, true);
            sinon.assert.calledOnce(event.stopImmediatePropagation);
         });

         [{
            position: 'top'
         }, {
            position: 'bottom',
         }, {
            position: 'topbottom'
         }].forEach(function(test) {
            it(`should register new header on position ${test.position}`, function() {
               let
                  event = {
                     stopImmediatePropagation: sinon.fake()
                  },
                  data = getRegisterObject(test);
               component._stickyRegisterHandler(event, data, true);
               assert.deepEqual(component._headers[data.id], data);
               if (test.position === 'topbottom') {
                  assert.include(component._headersStack['top'], data.id);
                  assert.include(component._headersStack['bottom'], data.id);
               } else {
                  assert.include(component._headersStack[test.position], data.id);
               }
            });
         });

         [{
            position: 'top'
         }, {
            position: 'bottom',
         }, {
            position: 'topbottom'
         }].forEach(function(test) {
            it('should unregister deleted header on position ${test.position}', function() {
               let event = {
                     blockUpdate: false,
                     stopImmediatePropagation: sinon.fake()
                  },
                  data = getRegisterObject(test);

               component._headers[data.id] = data;
               if (test.position === 'topbottom') {
                  component._headersStack['top'].push(data.id);
                  component._headersStack['bottom'].push(data.id);
               } else {
                  component._headersStack[test.position].push(data.id);
               }
               component._stickyRegisterHandler(event, data, false);
               assert.isUndefined(component._headers[data.id]);
               if (test.position === 'topbottom') {
                  assert.notInclude(component._headersStack['top'], data.id);
                  assert.notInclude(component._headersStack['bottom'], data.id);
               } else {
                  assert.notInclude(component._headersStack[test.position], data.id);
               }
            });
         });
      });

      describe('StickyHeader', function() {
         var event = {
            stopImmediatePropagation: function() {}
         };

         describe('_fixedHandler', function() {
            beforeEach(function() {
               component._headers = {
                  sticky1: {
                     mode: 'stackable',
                     inst: {
                        height: 10
                     }
                  },
                  sticky2: {
                     mode: 'stackable',
                     inst: {
                        height: 10
                     }
                  }
               }
            });
            it('Header with id equal to "sticky" stops being fixed', function() {
               component._fixedHandler(event, coreMerge({
                  id: 'sticky1',
                  fixedPosition: ''
               }, data, {preferSource: true}));

               assert.isEmpty(component._fixedHeadersStack.top);
               assert.isEmpty(component._fixedHeadersStack.bottom);
            });
            it('Header with id equal to "sticky" fixed', function() {
               component._fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: 'top'
               });
               assert.include(component._fixedHeadersStack.top, 'sticky1');

               component._fixedHandler(event, {
                  id: 'sticky2',
                  fixedPosition: 'bottom'
               });
               assert.include(component._fixedHeadersStack.bottom, 'sticky2');
            });
            it('Header with id equal to "sticky" fixed and then stop being fixed', function() {
               component._fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: 'top'
               });
               component._fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: '',
                  prevPosition: 'top'
               });

               assert.isEmpty(component._fixedHeadersStack.top);
               assert.isEmpty(component._fixedHeadersStack.bottom);
            });
            it('Header with id equal to "sticky1" fixed, Header with id equal to "sticky2" stop being fixed', function() {
               component._fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: 'top'
               });
               component._fixedHandler(event, {
                  id: 'sticky2',
                  fixedPosition: '',
                  prevPosition: 'top'
               });

               assert.include(component._fixedHeadersStack.top, 'sticky1');
               assert.notInclude(component._fixedHeadersStack.top, 'sticky2');
            });
            it('Header with id equal to "sticky1" stop being fixed, Header with id equal to "sticky2" fixed', function() {
               component._fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: '',
                  prevPosition: 'top'
               });
               component._fixedHandler(event, {
                  id: 'sticky2',
                  fixedPosition: 'top'
               });

               assert.include(component._fixedHeadersStack.top, 'sticky2');
               assert.notInclude(component._fixedHeadersStack.top, 'sticky1');
            });
            it('Should increase headers height if stackable header is fixed', function() {
               component._fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: 'top',
                  mode: 'stackable',
                  height: 10
               });

               assert.equal(component._headersHeight.top, 10);
            });
            it('Should decrease headers height if stackable header is unfixed', function() {
               component._fixedHeadersStack.top = ['sticky1'];
               component._headersHeight.top = 10;
               component._fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: '',
                  prevPosition: 'top',
                  mode: 'stackable',
                  height: 10
               });
               assert.equal(component._headersHeight.top, 0);
            });
            it('Should not change headers height if replaceable header is fixed', function() {
               component._fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: '',
                  prevPosition: 'top',
                  mode: 'replaceable',
                  height: 10
               });
               assert.equal(component._headersHeight.top, 0);
            });
            it('Should decrease headers height if stackable header is unfixed', function() {
               component._fixedHeadersStack.top = ['sticky1'];
               component._headersHeight.top = 10;
               component._fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: '',
                  prevPosition: 'top',
                  mode: 'replaceable',
                  height: 10
               });
               assert.equal(component._headersHeight.top, 10);
            });
            it('Should not notify new state if one header registered', function() {
               component._fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: 'top',
                  mode: 'stackable',
                  height: 10
               });
               sinon.assert.notCalled(component._children.stickyHeaderShadow.start);
            });
         });
      });

      describe('getHeadersHeight', function() {
         var event = {
            stopImmediatePropagation: function() {}
         };
         it('should return the correct height without registred headers.', function () {
            assert.equal(component.getHeadersHeight('top'), 0);
            assert.equal(component.getHeadersHeight('bottom'), 0);
         });
         it('should return the correct height after a new header has been registered.', function () {
            component._stickyRegisterHandler(event, data, true);
            assert.equal(component.getHeadersHeight('top'), 0);
            assert.equal(component.getHeadersHeight('bottom'), 0);
         });
         it('should return the correct height after a new replaceable header has been registered and fixed.', function () {
            component._stickyRegisterHandler(event, data, true);
            component._fixedHandler(event, {
                  id: data.id,
                  fixedPosition: 'top',
                  prevPosition: '',
                  height: 10
               });
            assert.equal(component.getHeadersHeight('top'), 10);
            assert.equal(component.getHeadersHeight('bottom'), 0);
         });

         it('should return the correct height after a new stackable header has been registered and fixed.', function () {
            component._stickyRegisterHandler(event, coreMerge({ mode: 'stackable' }, data, { preferSource: true }), true);
            component._fixedHandler(event, {
                  id: data.id,
                  fixedPosition: 'top',
                  prevPosition: '',
                  height: 10
               });
            assert.equal(component.getHeadersHeight('top'), 10);
            assert.equal(component.getHeadersHeight('bottom'), 0);
         });
      });

   });
});
