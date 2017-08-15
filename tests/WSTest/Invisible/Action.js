/**
 * Created by dv.zuev on 14.07.2017.
 */
define('js!WSTest/Invisible/Action',
   [
      'Core/Control'
   ],
   function(Base) {

      'use strict';

      var Action = Base.extend({

         execute: function(ev, callback){
            callback(this._options.someProp);
         }

      });

      return Action;
   }
)