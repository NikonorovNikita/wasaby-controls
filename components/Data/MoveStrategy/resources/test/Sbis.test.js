/* global define, beforeEach, afterEach, describe, context, it, assert, $ws */
define([
      'js!SBIS3.CONTROLS.Data.MoveStrategy.Sbis',
      'js!SBIS3.CONTROLS.Data.Di',
      'js!SBIS3.CONTROLS.Data.Source.Provider.IRpc',
      'js!SBIS3.CONTROLS.Data.Collection.RecordSet',
      'js!SBIS3.CONTROLS.Data.Source.SbisService'
   ],
   function (SbisMoveStrategy, Di, IRpc, RecordSet, SbisService) {
      'use strict';

      var SbisBusinessLogic = (function() {
            var Mock = $ws.core.extend({}, [IRpc], {
               _cfg: {},
               $constructor: function (cfg) {
                  this._cfg = cfg;
               },
               call: function (method, args) {
                  var def = new $ws.proto.Deferred();
                  setTimeout(function () {
                     if (args.ИдОПосле && args.ИдОПосле[0] == 3) {
                        def.errback(new Error('error'));
                     } else {
                        def.callback(true);
                     }
                  }.bind(this), 1);
                  Mock.lastRequest = {method:method, args:args};
                  return def;
               }
            });

            Mock.lastRequest = {};

            return Mock;
         })(),
         moveStrategy;

      describe('SBIS3.CONTROLS.Data.MoveStrategy.Sbis', function() {
         beforeEach(function() {
            moveStrategy = new SbisMoveStrategy({contract: 'test'});

            //Replace of standard with mock
            Di.register('source.provider.sbis-business-logic', SbisBusinessLogic);
         });

         describe('.$constructor', function (){
            it('should throw error when create with empty params', function() {
               assert.throw(function(){
                  moveStrategy = new SbisMoveStrategy({});
               });
            });
            it('should get contract from data source', function() {
               var service = new SbisService({
                  endpoint: 'Товар'
               });
               moveStrategy = new SbisMoveStrategy({
                  dataSource: service
               });
               assert.equal(moveStrategy._options.contract, 'Товар');
            });
            it('should support deprecated options', function() {
               moveStrategy = new SbisMoveStrategy({
                  resource: 'Товар',
                  moveResource: 'ТоварПеремещ'
               });
               assert.equal(moveStrategy._options.contract, 'Товар');
               assert.equal(moveStrategy._options.moveContract, 'ТоварПеремещ');
            });
         });

         describe('move()', function() {
            var  id1 = 1, id2 = 2, rs, rsComplex, objectName = 'newObj';
            beforeEach(function(){
               rs = new RecordSet({
                  rawData:[{
                     'id': id1,
                     'name': 'Иванов'
                  }, {
                     'id': id2,
                     'name': 'Петров'
                  }],
                  idProperty: 'id'
               });
               rsComplex = new RecordSet({
                  rawData:[{
                     'id': id1+','+objectName,
                     'name': 'Иванов'
                  }, {
                     'id': id2+','+objectName,
                     'name': 'Петров'
                  }, {
                     'id': '3,A',
                     'name': 'Петров'
                  }],
                  idProperty: 'id'
               });
            });

            it('should move record to up', function() {
               moveStrategy.move([rs.at(0)], rs.at(1), false);
               assert.equal(SbisBusinessLogic.lastRequest.args.ИдОДо[0], id2);
               assert.equal(SbisBusinessLogic.lastRequest.args.ИдО[0], id1);
            });

            it('should move record to down', function() {
               moveStrategy.move([rs.at(0)], rs.at(1), true);
               assert.equal(SbisBusinessLogic.lastRequest.args.ИдОПосле[0], id2);
               assert.equal(SbisBusinessLogic.lastRequest.args.ИдО[0], id1);
            });

            it('should move record with complex id to up', function() {
               moveStrategy.move([rsComplex.at(0)], rsComplex.at(1), false);
               assert.equal(SbisBusinessLogic.lastRequest.args.ИдОДо[0], id2);
               assert.equal(SbisBusinessLogic.lastRequest.args.ИдО[0], id1);
            });

            it('should move record with complex id to down', function() {
               moveStrategy.move([rsComplex.at(0)], rsComplex.at(1), true);
               assert.equal(SbisBusinessLogic.lastRequest.args.ИдОПосле[0], id2);
               assert.equal(SbisBusinessLogic.lastRequest.args.ИдОПосле[1], objectName);
               assert.equal(SbisBusinessLogic.lastRequest.args.ИдО[0], id1);
               assert.equal(SbisBusinessLogic.lastRequest.args.ИдО[1], objectName);
            });

            it('should return error when move method return error', function(done) {
               moveStrategy.move([rsComplex.at(0)], rsComplex.at(2), true).addErrback(function (){
                  done();
               });
            });

         });
      });
   }
);
