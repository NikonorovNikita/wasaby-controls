define(
   [
      'Controls/input'
   ],
   function(input) {

      'use strict';

      describe('Controls/_input/Mask/FormatBuilder', function() {
         var result;

         describe('_private.getMaskKeysString', function() {
            it('Test_01', function() {
               result = input.MaskFormatBuilder._private.getMaskKeysString({});
               assert.equal(result, '');
            });
            it('Test_02', function() {
               result = input.MaskFormatBuilder._private.getMaskKeysString({
                  'd': '[0-9]'
               });
               assert.equal(result, 'd');
            });
            it('Test_03', function() {
               result = input.MaskFormatBuilder._private.getMaskKeysString({
                  'L': '[А-ЯA-ZЁ]',
                  'l': '[а-яa-zё]',
                  'd': '[0-9]',
                  'x': '[А-ЯA-Zа-яa-z0-9ёЁ]'
               });
               assert.equal(result, 'Lldx');
            });
         });

         describe('_private.getReplacingKeyAsValue', function() {
            it('Test_01', function() {
               result = input.MaskFormatBuilder._private.getReplacingKeyAsValue({
                  'L': '[А-ЯA-ZЁ]',
                  'l': '[а-яa-zё]',
                  'd': '[0-9]',
                  'x': '[А-ЯA-Zа-яa-z0-9ёЁ]'
               }, 'd');
               assert.equal(result, '[0-9]?');
            });
         });

         describe('_private.getReplacingKeyFn', function() {
            it('Test_01', function() {
               result = input.MaskFormatBuilder._private.getReplacingKeyFn({
                  'L': '[А-ЯA-ZЁ]',
                  'l': '[а-яa-zё]',
                  'd': '[0-9]',
                  'x': '[А-ЯA-Zа-яa-z0-9ёЁ]'
               }, '');

               assert.isFunction(result);
               assert.equal(result('d', ''), '[0-9]?');
               assert.equal(result('d', '*'), '(?:[0-9]*)?');
            });
            it('Test_02', function() {
               result = input.MaskFormatBuilder._private.getReplacingKeyFn({
                  'L': '[А-ЯA-ZЁ]',
                  'l': '[а-яa-zё]',
                  'd': '[0-9]',
                  'x': '[А-ЯA-Zа-яa-z0-9ёЁ]'
               }, ' ');

               assert.isFunction(result);
               assert.equal(result('d', ''), '(?:[0-9]| )');
               assert.equal(result('d', '*'), '(?:[0-9]| )*');
            });
            it('Test_03', function() {
               result = input.MaskFormatBuilder._private.getReplacingKeyFn({
                  'L': '[А-ЯA-ZЁ]',
                  'l': '[а-яa-zё]',
                  'd': '[0-9]',
                  'x': '[А-ЯA-Zа-яa-z0-9ёЁ]'
               }, '*');

               assert.isFunction(result);
               assert.equal(result('d', ''), '(?:[0-9]|\\*)');
               assert.equal(result('d', '*'), '(?:[0-9]|\\*)*');
            });
         });

         describe('_private.getRegExpSearchingMaskChar', function() {
            it('Test_01', function() {
               result = input.MaskFormatBuilder._private.getRegExpSearchingMaskChar('', '', '');
               assert.deepEqual(result, /(;$)|([])(?:\\({.*?}|.))?|(([])|([]))|(.)/g);
            });
            it('Test_02', function() {
               result = input.MaskFormatBuilder._private.getRegExpSearchingMaskChar('d', '(', ')');
               assert.deepEqual(result, /(;$)|([d])(?:\\({.*?}|.))?|(([\(])|([\)]))|(.)/g);
            });
            it('Test_03', function() {
               result = input.MaskFormatBuilder._private.getRegExpSearchingMaskChar('Lldx', '', '');
               assert.deepEqual(result, /(;$)|([Lldx])(?:\\({.*?}|.))?|(([])|([]))|(.)/g);
            });
            it('Test_04', function() {
               result = input.MaskFormatBuilder._private.getRegExpSearchingMaskChar('', '(', ')');
               assert.deepEqual(result, /(;$)|([])(?:\\({.*?}|.))?|(([\(])|([\)]))|(.)/g);
            });
         });

         describe('getMaskCharData', function() {
            var
               regExp = input.MaskFormatBuilder._private.getRegExpSearchingMaskChar('dl', '(', ')'),
               mask = 'dl\\*().';

            beforeEach(function() {
               result = input.MaskFormatBuilder._private.getMaskCharData(regExp.exec(mask));
            });
            it('Test_key', function() {
               assert.deepEqual(result, {
                  value: 'd',
                  type: 'key',
                  quantifier: ''
               });
            });
            it('Test_keyWithQuantifier', function() {
               assert.deepEqual(result, {
                  value: 'l',
                  type: 'key',
                  quantifier: '*'
               });
            });
            it('Test_openPairingDelimiter', function() {
               assert.deepEqual(result, {
                  value: '(',
                  type: 'pairingDelimiter',
                  subtype: 'open'
               });
            });
            it('Test_closePairingDelimiter', function() {
               assert.deepEqual(result, {
                  value: ')',
                  type: 'pairingDelimiter',
                  subtype: 'close'
               });
            });
            it('Test_singlingDelimiter', function() {
               assert.deepEqual(result, {
                  value: '.',
                  type: 'singlingDelimiter'
               });
            });
         });

         describe('getFormat', function() {
            var
               masks = [
                  'dd.dd.dd',
                  '+7(ddd)ddd-dd-dd'
               ],
               formatMaskChars = {
                  'd': '[0-9]'
               },
               replacers = [
                  '',
                  ' '
               ];
            it('Test_01', function() {
               result = input.MaskFormatBuilder.getFormat(masks[0], formatMaskChars, replacers[0]);
               assert.deepEqual(result, {
                  searchingGroups: '^([0-9]?[0-9]?)(\\.)?([0-9]?[0-9]?)(\\.)?([0-9]?[0-9]?)$',
                  delimiterGroups: {
                     1: {
                        value: '.',
                        type: 'single'
                     },
                     3: {
                        value: '.',
                        type: 'single'
                     }
                  }
               });
            });
            it('Test_02', function() {
               result = input.MaskFormatBuilder.getFormat(masks[0], formatMaskChars, replacers[1]);
               assert.deepEqual(result, {
                  searchingGroups: '^((?:[0-9]| )(?:[0-9]| ))(\\.)?((?:[0-9]| )(?:[0-9]| ))(\\.)?((?:[0-9]| )(?:[0-9]| ))$',
                  delimiterGroups: {
                     1: {
                        value: '.',
                        type: 'single'
                     },
                     3: {
                        value: '.',
                        type: 'single'
                     }
                  }
               });
            });
            it('Test_03', function() {
               result = input.MaskFormatBuilder.getFormat(masks[1], formatMaskChars, replacers[0]);
               assert.deepEqual(result, {
                  searchingGroups: '^(\\+)?(7)?(\\()?([0-9]?)([0-9]?)([0-9]?)(\\))?([0-9]?[0-9]?[0-9]?)(-)?([0-9]?[0-9]?)(-)?([0-9]?[0-9]?)$',
                  delimiterGroups: {
                     0: {
                        value: '+',
                        type: 'single'
                     },
                     1: {
                        value: '7',
                        type: 'single'
                     },
                     2: {
                        value: '(',
                        type: 'pair',
                        subtype: 'open',
                        pair: ')'
                     },
                     6: {
                        value: ')',
                        type: 'pair',
                        subtype: 'close',
                        pair: '('
                     },
                     8: {
                        value: '-',
                        type: 'single'
                     },
                     10: {
                        value: '-',
                        type: 'single'
                     }
                  }
               });
            });
            it('Test_04', function() {
               result = input.MaskFormatBuilder.getFormat(masks[1], formatMaskChars, replacers[1]);
               assert.deepEqual(result, {
                  searchingGroups: '^(\\+)?(7)?(\\()?((?:[0-9]| ))((?:[0-9]| ))((?:[0-9]| ))(\\))?((?:[0-9]| )(?:[0-9]| )(?:[0-9]| ))(-)?((?:[0-9]| )(?:[0-9]| ))(-)?((?:[0-9]| )(?:[0-9]| ))$',
                  delimiterGroups: {
                     0: {
                        value: '+',
                        type: 'single'
                     },
                     1: {
                        value: '7',
                        type: 'single'
                     },
                     2: {
                        value: '(',
                        type: 'pair',
                        subtype: 'open',
                        pair: ')'
                     },
                     6: {
                        value: ')',
                        type: 'pair',
                        subtype: 'close',
                        pair: '('
                     },
                     8: {
                        value: '-',
                        type: 'single'
                     },
                     10: {
                        value: '-',
                        type: 'single'
                     }
                  }
               });
            });
         });
      });
   }
);
