define('Controls-demo/Popup/Opener/StackDemo',
   [
      'Core/Control',
      'wml!Controls-demo/Popup/Opener/StackDemo',
      'css!Controls-demo/Popup/PopupPageOld'
   ],
   function (Control, template) {
      'use strict';

      var PopupPage = Control.extend({
         _template: template,
         openStack: function () {
            this._children.stack.open({
               opener: this._children.button1,
               closeOnOutsideClick: true,
               width: 600
            });
         },
         openModalStack: function () {
            this._children.stack.open({
               opener: this._children.button4,
               isModal: true,
               width: 600
            });
         },
         openDialog: function () {
            this._children.dialog.open({
               opener: this._children.button3,
               closeOnOutsideClick: true,
               height: 500,
               maxHeight: 700
            });
         },
         openModalDialog: function () {
            this._children.dialog.open({
               opener: this._children.button5,
               isModal: true,
               height: 500,
               maxHeight: 700
            });
         },
         openMaximizedStack: function () {
            this._children.stack.open({
               opener: this._children.button2,
               minimizedWidth: 600,
               minWidth: 600,
               width: 600,
               maxWidth: 800,
               templateOptions: {
                  maximized: true,
                  maximizedButtonVisibility: true
               }
            });
         }
      });
      return PopupPage;
   }
);