define(
   [
      'Core/Control',
      'js!Controls/Input/Number'
   ],
   function(Control, NumberTextBox) {

      'use strict';

      describe('WSControls.Input.Number', function() {
         describe('Restrictions check', function() {
            //Проверим что в начало стоки нельзя вставить минус при onlyPositive: true
            it('Only positive values check', function () {
               var
                  inputResult;
               inputResult = NumberTextBox._private.prepareData.call(
                  {
                     _options: {
                        onlyPositive: true
                     }
                  },
                  {
                     before: '',
                     insert: '-',
                     after: '123',
                     delete: ''
                  }
               );
               assert.equal(inputResult.value, '123');
               assert.equal(inputResult.position, 0);
            });

            //Проверим что нельзя ввести больше указанного числа символов целой части
            it('Max integers length check', function () {
               var
                  inputResult;
               inputResult = NumberTextBox._private.prepareData.call(
                  {
                     _options: {
                        integersLength: 5
                     }
                  },
                  {
                     before: '12 345',
                     insert: '6',
                     after: '',
                     delete: ''
                  }
               );
               assert.equal(inputResult.value, '12 345');
               assert.equal(inputResult.position, 6);
            });

            //Проверим что нельзя ввести больше указанного числа символов дробной части
            it('Max decimals length check', function () {
               var
                  inputResult;
               inputResult = NumberTextBox._private.prepareData.call(
                  {
                     _options: {
                        precision: 5
                     }
                  },
                  {
                     before: '0.12345',
                     insert: '6',
                     after: '',
                     delete: ''
                  }
               );
               assert.equal(inputResult.value, '0.12345');
               assert.equal(inputResult.position, 7);
            });

            //Проверим что нельзя ввести точку, если precision: 0
            it('Forbid dot if zero precision', function () {
               var
                  inputResult;
               inputResult = NumberTextBox._private.prepareData.call(
                  {
                     _options: {
                        precision: 0
                     }
                  },
                  {
                     before: '12',
                     insert: '.',
                     after: '',
                     delete: ''
                  }
               );
               assert.equal(inputResult.value, '12');
               assert.equal(inputResult.position, 2);
            });

            //Проверим что при вводе точки в начало строки будет '0.'
            it('Inserting a dot at the beginning of a line results in \'0.\'', function () {
               var
                  inputResult;
               inputResult = NumberTextBox._private.prepareData.call(
                  {
                     _options: {
                     }
                  },
                  {
                     before: '',
                     insert: '.',
                     after: '',
                     delete: ''
                  }
               );
               assert.equal(inputResult.value, '0.');
               assert.equal(inputResult.position, 2);
            });

            //Проверим что при вводе вместо точки запятой или буквы "б" или буквы "ю" - они будут заменены
            it('Symbols ",", "б", "ю", "Б", "Ю" are replacing by dot', function () {
               var
                  inputResult,
                  possibleInsertValuesArr = [',', 'б', 'ю', 'Б', 'Ю'];

               possibleInsertValuesArr.forEach(function(item) {
                  inputResult = NumberTextBox._private.prepareData.call(
                     {
                        _options: {
                        }
                     },
                     {
                        before: '123',
                        insert: item,
                        after: '',
                        delete: ''
                     }
                  );
                  assert.equal(inputResult.value, '123.');
                  assert.equal(inputResult.position, 4);
               });
            });

            //При попытке удалить пробел происходит удаление символа левее него и сдвиг курсора влево
            it('Delete space operation removes symbol before space and moves cursor left', function () {
               var
                  inputResult;
               inputResult = NumberTextBox._private.prepareData.call(
                  {
                     _options: {
                     }
                  },
                  {
                     before: '123',
                     insert: '',
                     after: '456',
                     delete: ' '
                  }
               );
               assert.equal(inputResult.value, '12 456');
               assert.equal(inputResult.position, 2);
            });
         });
      });
   }
);