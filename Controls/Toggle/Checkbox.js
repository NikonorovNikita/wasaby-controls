define('Controls/Toggle/Checkbox', [
   'Core/Control',
   'tmpl!Controls/Toggle/Checkbox/Checkbox',
   'WS.Data/Type/descriptor',
   'css!Controls/Toggle/Checkbox/Checkbox'
], function(Control, template, types) {

   /**
    * Checkbox with support undefined state(options tristate) and tooltip. Tooltip should be used if the icon instead of the caption.
    *
    * <a href="/materials/demo-ws4-checkbox">Demo-example</a>.
    *
    * @class Controls/Toggle/Checkbox
    * @extends Core/Control
    * @mixes Controls/interface/ICaption
    * @mixes Controls/interface/ITooltip
    * @control
    * @public
    * @category Toggle
    * @demo Controls-demo/Checkbox/Checkbox
    *
    * @mixes Controls/Toggle/Checkbox/CheckboxStyles
    */

   /**
    * @name Controls/Toggle/Checkbox#triState
    * @cfg {Boolean} Determines whether the state of the tristate.
    */

   /**
    * @name Controls/Toggle/Checkbox#value
    * @cfg {Boolean|null} Current value.
    * @variant True Selected checkbox state.
    * @variant False Unselected checkbox state. It is default state.
    * @variant Null Tristate checkbox state.
    */

   /**
    * @event Controls/Toggle/Checkbox#valueChanged Occurs when state changes.
    * @param {Boolean|null} value New value.
    */

   var _private = {
      notifyChangeValue: function(self, value) {
         self._notify('valueChanged', [value]);
      }
   };

   var mapTriState = {false: true, true: null, null: false};
   var mapBoolState = {true: false, false: true};

   var Checkbox = Control.extend({
      _template: template,

      _clickHandler: function() {
         if (!this._options.readOnly) {
            var map = this._options.triState ? mapTriState : mapBoolState;
            _private.notifyChangeValue(this, map[this._options.value + '']);
         }
      }
   });

   Checkbox.getOptionTypes = function getOptionTypes() {
      return {
         triState: types(Boolean),
         tooltip: types(String)
      };
   };

   Checkbox.getDefaultOptions = function getDefaultOptions() {
      return {
         value: false,
         triState: false
      };
   };

   Checkbox._ptivate = _private;

   return Checkbox;
});
