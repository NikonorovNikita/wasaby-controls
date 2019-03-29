define([
   'Core/core-merge',
   'Core/helpers/Date/format',
   'Controls/Input/DateTime/StringValueConverter',
   'Controls/Utils/Date'
], function(
   cMerge,
   formatDate,
   StringValueConverter,
   dateUtils
) {
   'use strict';

   let
      options = {
         mask: 'DD.MM.YYYY',
         value: new Date(2018, 0, 1),
         replacer: '_',
      },
      now = new Date();

   describe('Controls/Input/DateTime/StringValueConverter', function() {

      describe('.update', function() {

         it('should update mask and replacer options', function() {
            let converter = new StringValueConverter(),
               mask = 'HH:mm',
               replacer = '-';
            converter.update(options);
            converter.update({ mask: mask, replacer: replacer });

            assert.strictEqual(converter._mask, mask);
            assert.strictEqual(converter._replacer, replacer);
         });

      });

      describe('.getStringByValue', function() {
         [{
            date: null,
            dateStr: ''
         }, {
            date: new Date('Invalid'),
            dateStr: ''
         }, {
            date: new Date(2018, 0, 1),
            dateStr: '01.01.2018'
         }].forEach(function(test) {
            it(`should return "${test.dateStr}" if "${test.date}" is passed`, function() {
               let converter = new StringValueConverter();
               converter.update(options);
               assert.strictEqual(converter.getStringByValue(test.date), test.dateStr);
            });
         });
      });

      describe('.getValueByString', function() {
         let year = now.getFullYear(),
            month = now.getMonth(),
            date = now.getDate(),
            shortYearStr = formatDate(now, 'YY'),
            monthStr = formatDate(now, 'MM'),
            dateStr = formatDate(now, 'DD');

         [
            // The day and month are filled
            // We substitute the current year
            { mask: 'DD.MM.YY', stringValue: '11.12.__', value: new Date(year, 11, 11) },
            // Automatically fill the current month and year
            { mask: 'DD.MM.YY', stringValue: '11.__.__', value: new Date(year, month, 11) },
            // Current year is filled
            // Autofill current month
            { mask: 'DD.MM.YY', stringValue: `11.__.${shortYearStr}`, value: new Date(year, month, 11) },
            // The current day and month are auto-charged
            { mask: 'DD.MM.YY', stringValue: `__.__.${shortYearStr}`, value: new Date(year, month, date) },
            // Current year and month are filled
            // Autofill current day
            { mask: 'DD.MM.YY', stringValue: `__.${monthStr}.${shortYearStr}`, value: new Date(year, month, date) },
            // A year is different from the current one
            // Autofill 01
            { mask: 'DD.MM.YY', stringValue: '11.__.00', value: new Date(2000, 0, 11) },
            // Autofill 01.01
            { mask: 'DD.MM.YY', stringValue: '__.__.00', value: new Date(2000, 0, 1) },
            { mask: 'DD.MM.YY', stringValue: '__.__.00', value: new Date(2000, 0, 1), autocomplete: 'start' },
            { mask: 'DD.MM.YY', stringValue: '__.__.00', value: new Date(2000, 11, 31), autocomplete: 'end' },

            // The year is different from the current year and month
            // Autofill 1
            { mask: 'DD.MM.YY', stringValue: '__.01.00', value: new Date(2000, 0, 1) },
            // [[2000, month + 1, null, null, null], new Date(2000, month + 1, 1), 'DD.MM.YY', []], // Подставляем 1
            // The field is completely empty
            { mask: 'DD.MM.YY', stringValue: '__.__.__', value: null },
            // [[null, null, null, null, null], now, 'DD.MM.YY', requiredValidator],
            // other cases
            { mask: 'DD.MM.YY', stringValue: '__.01.__', value: new Date('Invalid') },
            { mask: 'DD.MM', stringValue: '__.__', value: null },
            { mask: 'HH.mm', stringValue: '10.__', value: new Date(1900, 0, 1, 10) },
            { mask: 'HH.mm.ss', stringValue: '10.__.__', value: new Date(1900, 0, 1, 10) },
            { mask: 'HH.mm.ss', stringValue: '10.05.__', value: new Date(1900, 0, 1, 10, 5) },
            { mask: 'HH.mm.ss', stringValue: '6_.5_.1_', value: new Date(1900, 0, 1, 6, 5, 1) },
            { mask: 'HH.mm', stringValue: '__.10', value: new Date('Invalid') },

            // the date is more than maybe
            { mask: 'DD.MM.YY', stringValue: '55.12.00', value: new Date(2000, 11, 31) },

            // incorrect year
            { mask: 'DD.MM.YYYY', stringValue: '11.12.__20', value: new Date(2020, 11, 11) },
            { mask: 'DD.MM.YYYY', stringValue: '11.12._20_', value: new Date(2020, 11, 11) },
            { mask: 'DD.MM.YYYY', stringValue: '11.12.20__', value: new Date(2020, 11, 11) },
            { mask: 'DD.MM.YYYY', stringValue: '11.12.020_', value: new Date('Invalid') },
            { mask: 'DD.MM.YYYY', stringValue: '11.12._020', value: new Date('Invalid') },
            { mask: 'DD.MM.YYYY', stringValue: '11.12.0_20', value: new Date('Invalid') },
            { mask: 'DD.MM.YYYY', stringValue: '11.12._200', value: new Date('Invalid') },
            { mask: 'DD.MM.YYYY', stringValue: '11.12.200_', value: new Date('Invalid') },
            { mask: 'DD.MM.YYYY', stringValue: '11.12.0200', value: new Date('Invalid') },

            // incorrect time
            { mask: 'HH:mm:ss', stringValue: '80:80:80', value: new Date(1900, 0, 1, 23, 59, 59) },
            { mask: 'HH:mm:ss', stringValue: '80:10:10', value: new Date(1900, 0, 1, 23, 10, 10) },
            { mask: 'HH:mm:ss', stringValue: '10:80:80', value: new Date(1900, 0, 1, 10, 59, 59) },
            { mask: 'HH:mm:ss', stringValue: '10:10:80', value: new Date(1900, 0, 1, 10, 10, 59) },
            { mask: 'HH:mm', stringValue: '80:80', value: new Date(1900, 0, 1, 23, 59, 0) },
            { mask: 'HH:mm', stringValue: '10:80', value: new Date(1900, 0, 1, 10, 59, 0) },
            { mask: 'HH:mm', stringValue: '24:60', value: new Date(1900, 0, 1, 23, 59, 0) },
            { mask: 'HH:mm', stringValue: '80:10', value: new Date(1900, 0, 1, 23, 10, 0) }
         ].forEach(function(test) {
            it(`should return ${test.value} if "${test.stringValue}" is passed`, function() {
               let converter = new StringValueConverter(),
                  rDate;
               converter.update(cMerge({ mask: test.mask }, options, { preferSource: true }));
               rDate = converter.getValueByString(test.stringValue, null, test.autocomplete || true);
               assert(dateUtils.isDatesEqual(rDate, test.value), `${rDate} is not equal ${test.value}`);
            });
         });
      });

      describe('.getCurrentDate', function() {
         const
            baseDate = new Date(2018, 10, 10, 10, 10, 10);
            let clock,
            currentYear = 2019,
            currentMonth = 5,
            currentDay = 6,
            currentHour = 7,
            currentMinutes = 8,
            currentSeconds = 9,
            currentDate = new Date(currentYear, currentMonth, currentDay, currentHour, currentMinutes, currentSeconds);

         beforeEach(() => {
            clock = sinon.useFakeTimers(currentDate.getTime(), 'Date');
         });

         afterEach(() => {
            clock && clock.restore();
         });

         let baseYear = baseDate.getFullYear(),
            baseMonth = baseDate.getMonth(),
            baseDay = baseDate.getDate(),
            baseHour = baseDate.getHours(),
            baseMinutes = baseDate.getMinutes(),
            baseSeconds = baseDate.getSeconds();
         [
            { mask: 'DD.MM.YYYY', value: new Date(currentYear, currentMonth, currentDay, baseHour, baseMinutes, baseSeconds) },
            { mask: 'DD.MM.YY', value: new Date(currentYear, currentMonth, currentDay, baseHour, baseMinutes, baseSeconds) },
            { mask: 'YYYY', value: new Date(currentYear, baseMonth, baseDay, baseHour, baseMinutes, baseSeconds) },
            { mask: 'HH:mm', value: new Date(baseYear, baseMonth, baseDay, currentHour, currentMinutes, baseSeconds) },
            { mask: 'HH:mm:ss', value: new Date(baseYear, baseMonth, baseDay, currentHour, currentMinutes, currentSeconds) },
            { mask: 'DD.MM HH:mm', value: new Date(baseYear, currentMonth, currentDay, currentHour, currentMinutes, baseSeconds) },
            { mask: 'DD.MM HH:mm:ss', value: new Date(baseYear, currentMonth, currentDay, currentHour, currentMinutes, currentSeconds) },
            { mask: 'DD.MM.YY HH:mm', value: new Date(currentYear, currentMonth, currentDay, currentHour, currentMinutes, baseSeconds) },
            { mask: 'DD.MM.YY HH:mm:ss', value: new Date(currentYear, currentMonth, currentDay, currentHour, currentMinutes, currentSeconds) },
            { mask: 'DD.MM.YYYY HH:mm', value: new Date(currentYear, currentMonth, currentDay, currentHour, currentMinutes, baseSeconds) },
            { mask: 'DD.MM.YYYY HH:mm:ss', value: new Date(currentYear, currentMonth, currentDay, currentHour, currentMinutes, currentSeconds) }
         ].forEach(function(test) {
            it(`should return curent date if it icludes "${test.mask}"`, function() {
               let converter = new StringValueConverter();
               let tested = converter.getCurrentDate(baseDate, test.mask);
               assert(dateUtils.isDatesEqual(tested, test.value),`"${tested}" "${test.value}"`);
               clock.restore();
            });
         });
      });
   });
});
