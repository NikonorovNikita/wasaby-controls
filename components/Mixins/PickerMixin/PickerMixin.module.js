define('js!SBIS3.CONTROLS.PickerMixin', ['js!SBIS3.CONTROLS.FloatArea'], function(FloatArea) {
   /**
    * Контрол умеющий отображать выдающий вниз блок
    * Задается контент (протектед методом каким-то) и методы которые позволяют открывать, закрывать блок.
    * @mixin SBIS3.CONTROLS.PickerMixin
    */
   var PickerMixin = /** @lends SBIS3.CONTROLS.PickerMixin.prototype */{
      $protected: {
         _picker : null,
         _border : 0,
         _options: {
            pickerClassName : ''
         }
      },

      $constructor: function() {

      },

      _initializePicker: function () {
         var
            self = this,
            pickerContainer = $('<div></div>'),
            container = self._container;

         if (this._options.pickerClassName) {
            pickerContainer.addClass(this._options.pickerClassName);
         }

         // чтобы не нарушать выравнивание по базовой линии
         $('body').append(pickerContainer);
         self._picker = this._createPicker(pickerContainer);
         this._publish('onPopupAlignmentChange');
         this._picker.subscribe('onAlignmentChange', function(event, alignment){
            self._notify('onPopupAlignmentChange', alignment);
         });
         self._picker.subscribe('onClose', function(){
            self._container.removeClass('controls-Picker__show');
         });
         self._setWidth();
         container.hover(function(){
            self._picker.getContainer().addClass('controls-Picker__owner__hover');
         }, function () {
            self._picker.getContainer().removeClass('controls-Picker__owner__hover');
         });
         self._border = self._container.outerWidth() - self._container.innerWidth();
         self._setPickerContent();
      },

      _createPicker: function(pickerContainer){
         var pickerConfig = this._setPickerConfig();
         pickerConfig.parent = this.getParent();
         pickerConfig.context = this.getParent() ? this.getParent().getLinkedContext() : {};
         pickerConfig.target = this._container;
         pickerConfig.element = pickerContainer;
         return new FloatArea(pickerConfig);
      },

      _setPickerConfig: function(){
         return {
            corner: 'bl',
            verticalAlign: {
               side: 'top'
            },
            horizontalAlign: {
               side: 'left'
            },
            closeByExternalClick: true
         };
      },

      /**
       * Показывает выпадающий блок
       */
      showPicker: function() {
         if (!this._picker) {
            this._initializePicker();
         }
         this._container.addClass('controls-Picker__show');
         this._setWidth();
         this._picker.show();
      },
      /**
       * Скрывает выпадающий блок
       */
      hidePicker: function() {
         if (!this._picker) {
            this._initializePicker();
         }
         this._container.removeClass('controls-Picker__show');
         this._picker.hide();
      },
     /**
      * Изменяет состояние выпадающего блока на противоположное (скрывает/показывает)
      */
      togglePicker: function() {
         if (!this._picker) {
            this._initializePicker();
            this.showPicker();
         }
         else {
            this._container.toggleClass('controls-Picker__show');
            if (this._picker.isVisible()) {
               this.hidePicker();
            } else {
               this.showPicker();
            }
         }
      },

      _setWidth: function(){
         var self = this;
         this._picker.getContainer().css({
            'min-width': self._container.outerWidth() - this._border/*ширина бордеров*/
         });
      },

      _setPickerContent: function () {
         /*Method must be implemented*/
      },

      after : {
         destroy : function(){
            if (this._picker) {
               this._picker.destroy();
            }
         }
      }

   };

   return PickerMixin;

});