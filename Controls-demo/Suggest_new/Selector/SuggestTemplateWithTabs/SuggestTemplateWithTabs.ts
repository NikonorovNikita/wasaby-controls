import {Control, TemplateFunction} from "UI/Base";
import {Memory} from 'Types/source';
import {getDefaultNavigation, getSuggestTabSource} from 'Controls-demo/Suggest_new/DemoHelpers/DataCatalog';
import controlTemplate = require('wml!Controls-demo/Suggest_new/Selector/SuggestTemplateWithTabs/SuggestTemplateWithTabs');
import 'css!Controls-demo/Controls-demo';

export default class extends Control{
   protected _template: TemplateFunction = controlTemplate;
   private _source: Memory;
   private _defaultNavigation: object;
   protected _beforeMount() {
      this._source = getSuggestTabSource();
      this._defaultNavigation = getDefaultNavigation();
   }
}