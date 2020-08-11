/**
 * Библиотека контролов, которые служат для задания набора шаблонов, из которых в каждый момент времени может отображаться только один, с возможностью переключения между этими шаблонами.
 * @library Controls/tabs
 * @includes Buttons Controls/_tabs/Buttons
 * @includes ITabsButtonsOptions Controls/_tabs/interface/ITabsButtons
 * @public
 * @author Крайнов Д.О.
 */

/*
 * tabs library
 * @library Controls/tabs
 * @includes Buttons Controls/_tabs/Buttons
 * @includes ITabsButtonsOptions Controls/_tabs/interface/ITabsButtons
 * @public
 * @author Крайнов Д.О.
 */

export {default as Buttons} from 'Controls/_tabs/Buttons';
export {default as Base} from 'Controls/_tabs/Base';
export {ITabsButtons, ITabsButtonsOptions} from 'Controls/_tabs/interface/ITabsButtons';
import buttonsItemTemplate = require('wml!Controls/_tabs/Buttons/ItemTemplate');

export {
   buttonsItemTemplate
};
