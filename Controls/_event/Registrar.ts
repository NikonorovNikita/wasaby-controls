import cExtend = require('Core/core-simpleExtend');

export interface IRegistrarConfig {
   listenAll?: boolean
}

var Registrar = cExtend.extend({

   _registry: null,

   constructor: function(cfg) {
      Registrar.superclass.constructor.apply(this, arguments);
      this._registry = {};
      this._options = cfg;
   },

   register: function(event, component, callback, config: IRegistrarConfig = {}) {
      this._registry[component.getInstanceId()] = {
         component: component,
         callback: callback
      };
      const previousUnmountCallback = component.unmountCallback;
      component.unmountCallback = () => {
         if (typeof previousUnmountCallback === 'function') {
            previousUnmountCallback();
         }
         this.unregister(event, component);
      };
      if (!config.listenAll) {
         event.stopPropagation();
      }
   },
   unregister: function(event, component, config: IRegistrarConfig = {}) {
      delete this._registry[component.getInstanceId()];
      if (!config.listenAll) {
         event.stopPropagation();
      }
   },
   start: function() {
      if (!this._registry) {
         return;
      }
      for (var i in this._registry) {
         if (this._registry.hasOwnProperty(i)) {
            var obj = this._registry[i];
            obj && obj.callback.apply(obj.component, arguments);
         }
      }
   },

   startAsync: function() {
      if (!this._registry) {
         return;
      }
      var promises = [];
      for (var i in this._registry) {
         if (this._registry.hasOwnProperty(i)) {
            var obj = this._registry[i];
            var res = obj && obj.callback.apply(obj.component, arguments);
            promises.push(res);
         }
      }

      return Promise.all(promises);
   },

   startOnceTarget: function(target) {
      var argsClone;
      if (!this._registry) {
         return;
      }
      for (var i in this._registry) {
         if (this._registry.hasOwnProperty(i)) {
            var obj = this._registry[i];
            if (obj.component === target) {
               argsClone = Array.prototype.slice.call(arguments);
               argsClone.splice(0, 1);
               obj && obj.callback.apply(obj.component, argsClone);
            }
         }
      }
   },

   destroy: function() {
      this._options = {};
      this._registry = {};
   }

});

export = Registrar;

