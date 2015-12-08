/**
 * Created by ad.chistyakova on 11.09.2015.
 */
define('js!SBIS3.CONTROLS.Demo.MyFastDataFilter',
   [
      'js!SBIS3.CORE.CompoundControl',
      'js!SBIS3.CONTROLS.FastDataFilter',
      'js!SBIS3.CONTROLS.Demo.FilterButtonMain',
      'html!SBIS3.CONTROLS.Demo.MyFastDataFilter',
      'css!SBIS3.CONTROLS.Demo.MyFastDataFilter'
   ],

   function(CompoundControl, FastDataFilter, FilterButtonMainDemo, dotTplFn) {
      'use strict';
      var MyFastDataFilter = CompoundControl.extend([],{
         $protected: {
            _dotTplFn: dotTplFn,
            _options: {
               data: [{
                  keyField : 'key',
                  displayField: 'title',
                  name: 'first',
                  multiselect : false,
                  className: 'controls-DropdownList__withoutCross',
                  values:[
                     {
                        key : 0,
                        title : 'Заголовок'
                     },
                     {
                        key : 1,
                        title : 'Один'
                     },
                     {
                        key : 2,
                        title : 'Два'
                     },
                     {
                        key : 3,
                        title : 'Три'
                     },
                     {
                        key : 4,
                        title : 'Четыре'
                     },
                     {
                        key : 5,
                        title : 'Пять'
                     }
                  ]
               },
               {
                  keyField : 'secondKey',
                  multiselect : true,
                  name: 'second',
                  displayField: 'user',
                  values:[
                     {
                        secondKey : 0,
                        user : 'Все пользователи'
                     },
                     {
                        secondKey : 1,
                        user : 'Пушкин'
                     },
                     {
                        secondKey : 2,
                        user : 'Лермонтов'
                     },
                     {
                        secondKey : 3,
                        user : 'Толстой'
                     },
                     {
                        secondKey : 4,
                        user : 'Бродский'
                     }
                  ]
               },
               {
                  keyField : 'key',
                  displayField: 'title',
                  name: 'selling',
                  multiselect : false,
                  values:[
                     {
                        key : 0,
                        title : 'Не выбрано'
                     },
                     {
                        key : 1,
                        title : 'Все (для продажи и нет)'
                     },
                     {
                        key : 2,
                        title : 'Не для продажи'
                     },
                     {
                        key : 3,
                        title : 'Для продажи'
                     }
                  ]
               }]
            }
         },
         $constructor: function(){
            var context = this.getLinkedContext();

            context.subscribe('onFieldsChanged', function() {
               var
                     filter = this.getValue('filter'),
                     filterDescr = this.getValue('filterDescr');
               this.setValueSelf('filterJSON', JSON.stringify(filter));
               this.setValueSelf('filterDescrJSON', JSON.stringify(filterDescr));
            });

            context.setValueSelf({
               filter: {
               },
               filterDescr: {
                  NDS: 'Не выбрано'
               }
            });
         },
         init: function () {
            MyFastDataFilter.superclass.init.apply(this, arguments);
            this.getChildControlByName('FastDataFilter').setItems(this._options.data);
            //this.getChildControlById('FilterButtonMain').
            //this.getChildControlByName('FastDataFilter').reload;
         }
      });
      return MyFastDataFilter;
   });
