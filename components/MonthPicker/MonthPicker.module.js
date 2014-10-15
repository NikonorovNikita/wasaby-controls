/**
 * @author io.frolenko
 * Created on 03.10.2014.
 * TODO компонент пока что тестировался только в Chrome и IE9
 */

define(
   'js!SBIS3.CONTROLS.MonthPicker',
   [
      'js!SBIS3.CORE.Control',
      'js!SBIS3.CONTROLS._PickerMixin',
      'html!SBIS3.CONTROLS.MonthPicker/resources/MonthPickerDropdownMonth',
      'html!SBIS3.CONTROLS.MonthPicker/resources/MonthPickerDropdownYear',
      'html!SBIS3.CONTROLS.MonthPicker'
   ],
   function(Control, _PickerMixin, DropdownMonthTpl, DropdownYearTpl, dotTplFn){

   'use strict';

   /**
    * Контрол выбор месяца и года, или только года, с выпадающей вниз панелью.
    * Не наследуется от поля ввода, потому что там в принципе не требуется текстовый ввод
    * @class SBIS3.CONTROLS.MonthPicker
    * @extends SBIS3.CORE.Control
    * @mixes SBIS3.CONTROLS._PickerMixin
    */

   var MonthPicker = Control.Control.extend( [_PickerMixin], /** @lends SBIS3.CONTROLS.MonthPicker.prototype */{
      _dotTplFn: dotTplFn,
      _dropdownMonthTpl: DropdownMonthTpl,
      _dropdownYearTpl: DropdownYearTpl,

      $protected: {
         _options: {
            /**
             * @typedef {Object} ModeEnum
             * @variant month только месяц
             * @variant year месяц и год
             */
            /**
             * @cfg {ModeEnum} ввод только месяца или месяца и года (month/year)
             */
            mode: 'month',
            /**
             * @cfg {String|Date} Значение для установки по умолчанию
             * <wiTag group="Данные">
             * Можно задать:
             * <ol>
             *    <li>строку формата "ГГГГ, ММ, ДД", т.е. значения отделяются запятой, строго в таком порядке и только
             * полный год в 4 цифры;</li>
             *    <li>значение типа Date.</li>
             * </ol>
             * В зависимости от режима работы, установленного во {@link viewType}, возьмутся месяц и год, либо только год.
             */
            defaultValue: '',
            /**
             * @cfg {String} формат визуального отображения месяца
             * TODO на данный момент нигде не используется
             */
            monthFormat: ''
         },

         /**
          * Текущее значение даты в поле
          */
         _currentValue: undefined,

         /**
          * Массив месяцев
          */
         _months: [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
         ],

         _KEYS: {
            ARROW_LEFT: 37,
            ARROW_UP: 38,
            ARROW_RIGHT: 39,
            ARROW_DOWN: 40
         }
      },

      $constructor: function() {
         var self = this;

         this.setMode(this._options.mode);
         if ( this._options.defaultValue ) { this.setDate(this._options.defaultValue); }

         // При слишком частом клике на стрелочку срабатывает событие двойного клика,
         // поведение по умолчанию которого -- выделить текст. Этого не нужно -- снимаем выделение.
         $(this.getContainer().get(0)).dblclick(function(){
               try { window.getSelection().removeAllRanges(); }
               catch(e) { document.selection.empty(); } // IE<9
            }
         );

         $('.js-controls-MonthPicker__arrowRight', this.getContainer().get(0)).click(function(){
            self.setNext();
         });
         $('.js-controls-MonthPicker__arrowLeft', this.getContainer().get(0)).click(function(){
            self.setPrev();
         });
         $('.js-controls-MonthPicker__field', this.getContainer().get(0)).click(function(){
            self._refreshDropdown();
            self._picker.getContainer().width(self.getContainer().outerWidth());
            self.togglePicker();
         });
         $(this.getContainer().get(0)).keydown(function(event){
            if( event.which == self._KEYS.ARROW_RIGHT ){ self.setNext(); }
            else if( event.which == self._KEYS.ARROW_LEFT ){ self.setPrev(); }
            else if( event.which == self._KEYS.ARROW_UP ){
               self.setDate(new Date(self._currentValue.setFullYear(self._currentValue.getFullYear() + 1)));
            }
            else if( event.which == self._KEYS.ARROW_DOWN ){
               self.setDate(new Date(self._currentValue.setFullYear(self._currentValue.getFullYear() - 1)));
            }
         });
      },

      /**
       * Установить режим ввода (месяц / месяц,год)
       * @param {String} mode
       */
      setMode: function(mode) {
         this._options.mode = mode;

         var self = this;

         this._picker.getContainer().empty();

         if( mode == 'month' ){
            $('.js-controls-MonthPicker__fieldBox', this.getContainer().get(0))
               .removeClass('controls-MonthPicker__fieldBoxYear')
               .addClass('controls-MonthPicker__fieldBoxMonth');

            this._picker.getContainer().append(self._dropdownMonthTpl);
            this._picker.getContainer().css('margin-top', -this.getContainer().height());

            var titleContainer = $('.js-controls-MonthPicker__dropdownTitle', this._picker.getContainer());

            $('.js-controls-MonthPicker__dropdownArrowLeft', this._picker.getContainer()).click(function(){
               titleContainer.text(parseInt(titleContainer.text(), 10) - 1);
            });
            $('.js-controls-MonthPicker__dropdownArrowRight', this._picker.getContainer()).click(function(){
               titleContainer.text(parseInt(titleContainer.text(), 10) + 1);
            });

            this._picker.getContainer().keydown(function(event){
               if( event.which == self._KEYS.ARROW_RIGHT ){ titleContainer.text(parseInt(titleContainer.text(), 10) + 1); }
               else if( event.which == self._KEYS.ARROW_LEFT ){ titleContainer.text(parseInt(titleContainer.text(), 10) - 1); }
            });

            $('.js-controls-MonthPicker__dropdownElement', this._picker.getContainer()).click(function(){
               self._setDate(new Date(parseInt(titleContainer.text(), 10), $(this).attr('data-key'), 1, 20, 0, 0));
               self.hidePicker();
               self.getContainer().focus();
            });
         }
         else if( mode == 'year' ){
            $('.js-controls-MonthPicker__fieldBox', this.getContainer().get(0))
               .removeClass('controls-MonthPicker__fieldBoxMonth')
               .addClass('controls-MonthPicker__fieldBoxYear');

            this._picker.getContainer().append(self._dropdownYearTpl);

            $('.js-controls-MonthPicker__dropdownElement', this._picker.getContainer()).click(function(){
               self._setDate(new Date(parseInt($(this).text(), 10), 0, 1, 20, 0, 0));
               self.hidePicker();
               self.getContainer().focus();
            });
         }

         this.setToday();
      },

      /**
       * Установить текущий месяц/год
       */
      setToday: function() {
         this._setDate(new Date());
      },

      /**
       * Установить дату по полученному значению. Публичный метод. Может принимает либо строку
       * формата 'число.число' или 'число', либо объект типа Date
       * @param value Строка или дата
       */
      setDate: function(value) {
         if( value instanceof Date ){ this._setDate(value); }
         else if( typeof value == 'string' ){
            if ( this._checkValue(value) ){
               var
                  dotExpResult = /\./.exec(value),
                  date;
               if ( dotExpResult ){
                  date = new Date(parseInt(value.slice(dotExpResult.index + 1), 10),
                     parseInt(value.slice(0, dotExpResult.index), 10) - 1, 1, 20, 0, 0);
               }
               else {
                  date = new Date(parseInt(value, 10), 0, 1, 20, 0, 0);
               }
               this._setDate(date);
            }
            else { throw new Error('Неверный формат даты'); }
         }
         this.hidePicker();
      },

      /**
       * Установить следующий месяц/год
       */
      setNext: function() {
         var
            currentDate = this._currentValue || new Date(),
            newDate;

         if ( this._options.mode == 'month' ){ newDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1)); }
         else if ( this._options.mode == 'year' ){ newDate = new Date(currentDate.setYear(currentDate.getFullYear() + 1)); }

         this._setDate(newDate);
         this.hidePicker();
      },

      /**
       * Установить предыдущий месяц/год
       */
      setPrev: function() {
         var
            currentDate = this._currentValue || new Date(),
            newDate;

         if ( this._options.mode == 'month' ){ newDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1)); }
         else if ( this._options.mode == 'year' ){ newDate = new Date(currentDate.setYear(currentDate.getFullYear() - 1)); }

         this._setDate(newDate);
         this.hidePicker();
      },

      /**
       * Возвращает текущее значение даты.
       * В случае года, возвращает дату 1-ого дня 1-ого месяца данного года.
       * В случае месяца и года, возвращает дату 1-ого дня данного месяца данного года
       * @returns {Date|*} Текущая дата
       */
      getDate: function(){
         return this._currentValue;
      },

      /**
       * Взовращает дату в виде строки формата 'YYYY-MM-DD'
       * @returns {string}
       */
      getTextDate: function(){
         return this._currentValue.toISOString().slice(0, 10);
      },

      /**
       * Взвращает интервал даты (массив из двух дат), где, в случае 'месац, год':
       * начало интервала - первый день данного месяца данного года, конец - последний день данного месяца данного года
       * а в случае режима 'год':
       * начало интервала - первый день данного года, конец - последний день данного года
       * @returns {*[]}
       */
      getInterval: function(){
         var
            startInterval = this._currentValue,
            endInterval;
         if ( this._options.mode == 'month' ){
            endInterval = new Date(startInterval.getFullYear(), startInterval.getMonth() + 1, 0, 20, 0, 0);
         }
         else if ( this._options.mode == 'year' ){
            endInterval = new Date(startInterval.getFullYear(), 11, 31, 20, 0, 0);
         }

         return [startInterval, endInterval];
      },

      /**
       * Установить дату по объекту типа Date. Приватный метод, работает только с типом Date
       * @param date Дата, по которой устанавливается новое значение
       * @private
       */
      _setDate: function(date){
         var
            month = ( this._options.mode == 'month' ) ? date.getMonth() : 0,
            year = date.getFullYear();
         // Явно устанавливаем ненулевое время, т.к. в некоторых случаях при значениях по умолчанию
         // нам отдается предыдущий месяц, например, при new Date(2020, 0, 1), то есть если мы хотим
         // задать 2020 год 1 января, нам вернётся, как ни странно, Tue Dec 31 2019 23:00:00 GMT+0300 (RTZ 2 (зима))
         this._currentValue = new Date(year, month, 1, 20, 0, 0);
         var fieldContainer = $('.js-controls-MonthPicker__field', this.getContainer().get(0));
         if( this._options.mode == 'month' ){ fieldContainer.text(this._months[month] + ', ' + year); }
         else if( this._options.mode == 'year' ){ fieldContainer.text(year); }
      },


      /**
       * Обновить выпадающий список в соответствии с типом mode
       * @private
       */
      _refreshDropdown: function(){
         var
            self = this,
            temporary;
         if( self._options.mode == 'month' ) {
            $('.js-controls-MonthPicker__dropdownTitle', this._picker.getContainer().get(0)).text(this._currentValue.getFullYear());
            $('.js-controls-MonthPicker__dropdownElement', this._picker.getContainer().get(0)).each(function () {
               $(this).removeClass('controls-MonthPicker__dropdownElementActive');
               if ( $(this).attr('data-key') == self._currentValue.getMonth() ){
                  $(this).addClass('controls-MonthPicker__dropdownElementActive');
               }
            });
         }
         else if( self._options.mode == 'year' ) {
            $('.js-controls-MonthPicker__dropdownElement', this._picker.getContainer().get(0)).each(function () {
               $(this).removeClass('controls-MonthPicker__dropdownElementActive');
               temporary = parseInt(self._currentValue.getFullYear(), 10) + $(this).index() - 3;
               $(this).text(temporary);
               if ( temporary == parseInt(self._currentValue.getFullYear(), 10) ){
                  $(this).addClass('controls-MonthPicker__dropdownElementActive');
               }
            });
         }

         // picker's width
         //$('.js-controls-MonthPicker__dropdownWrapper', this._picker.getContainer().get(0))
         //   .width( $(this.getContainer().get(0)).width() );
      },

      /**
       * Проверить, удовлетворяет ли строка значению типа 'число.число' (где первое от одного до двух символов,
       * а второе от одного до четырех символов) или типа 'число' (от одного до четырёх символов)
       * Иными словами, проверяет, является ли значение корректной датой 'месяц.год' или 'год'
       * @param value
       * @returns {boolean}
       * @private
       */
      _checkValue: function(value){
         return /^(?:\d{1,2}\.)?\d{1,4}$/.test(value);
      }
   });

   return MonthPicker;
});