import merge = require('Core/core-merge');
import {StackOpener, IStackPopupOptions} from 'Controls/popup';

function getPopupOptions(self): IStackPopupOptions {
    const selectorTemplate = self._options.selectorTemplate;

    return {
        opener: self,
        template: selectorTemplate && selectorTemplate.templateName,
        closeOnOutsideClick: true,
        isCompoundTemplate: self._options.isCompoundTemplate,
        eventHandlers: {
            onResult: (result) => {
                self._selectCallback(null, result);
            },
            onClose: () => {
                self._closeHandler();
                self._notify('selectorClose');
            }
        }
    };
}

function getTemplateOptions(self, multiSelect) {
    return {
        selectedItems: self._lookupController.getItems().clone(),
        multiSelect: multiSelect,
        handlers: {
            onSelectComplete: function (event, result) {
                self._stack.close();
                if (self._options.isCompoundTemplate) {
                    self._selectCallback(null, result);
                }
            }
        }
    };
}

/**
 * Open selector
 * @param {Controls/_lookup/BaseController} self
 * @param {Object} popupOptions
 * @param {Boolean} multiSelect
 * @returns {Promise}
 */
export default function(self, popupOptions, multiSelect) {
    if (!self._stack) {
        self._stack = new StackOpener();
    }
    const selectorTemplate = self._options.selectorTemplate;
    const stackPopupOptions = getPopupOptions(self);

    if (selectorTemplate && selectorTemplate.popupOptions) {
        merge(stackPopupOptions, selectorTemplate.popupOptions);
    }

    if (popupOptions && popupOptions.template || selectorTemplate) {
        stackPopupOptions.templateOptions = getTemplateOptions(self, multiSelect);

        if (popupOptions) {
            merge(stackPopupOptions, popupOptions);
        }

        if (selectorTemplate && selectorTemplate.templateOptions) {
            merge(stackPopupOptions.templateOptions, selectorTemplate.templateOptions);
        }

        self._stack.open(stackPopupOptions);
        return true;
    }
    return false;
}
