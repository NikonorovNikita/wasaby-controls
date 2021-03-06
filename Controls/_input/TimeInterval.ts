import Base = require('Controls/_input/Base');

import {descriptor, TimeInterval} from 'Types/entity';
import {IOptions as IModelOptions, ViewModel} from 'Controls/_input/TimeInterval/ViewModel';

type IOptions = IModelOptions;

/**
 * Поле ввода временного интервала.
 * @remark
 * Позволяет вводить время с точностью от суток до секунд.
 *
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FExample%2FInput">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/input/date/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_input.less">переменные тем оформления</a>
 *
 * @class Controls/_input/TimeInterval
 * @extends Controls/_input/Base
 * // TODO: https://online.sbis.ru/doc/f654ff87-5fa9-4c80-a16e-fee7f1d89d0f
 * @ignoreOptions Controls/_input/Base#value
 *
 * @mixes Controls/interface/ITimeInterval
 *
 * @ignoreOptions Controls/_input/Base#placeholder
 *
 * @public
 * @demo Controls-demo/Input/TimeInterval/Base/Index
 *
 * @author Красильников А.С.
 */

/*
 * Controls that allows user to enter some amount of time with the accuracy from day to seconds.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FExample%2FInput">Demo examples.</a>.
 * @remark
 * If container with width: auto, then the width is determined based on the content.
 *
 * @class Controls/_input/TimeInterval
 * @extends Controls/_input/Base
 *
 * @mixes Controls/interface/ITimeInterval
 *
 * @public
 * @demo Controls-demo/Input/TimeInterval/Base/Index
 *
 * @author Красильников А.С.
 */

class TimeInterval extends Base {
    protected _autoWidth: boolean = true;

    protected _defaultValue: TimeInterval | null = null;

    protected _getViewModelOptions(options: IOptions): IModelOptions {
        return {
            mask: options.mask
        };
    }

    protected _getViewModelConstructor() {
        return ViewModel;
    }

    protected _notifyInputCompleted() {
        if (this._viewModel.autoComplete()) {
            this._notifyValueChanged();
        }

        super._notifyInputCompleted();
    }

    protected _focusInHandler(...args) {
        const isTab: boolean = !this._focusByMouseDown;

        /**
         * По стандарту "При получение фокуса по Tab в заполненном поле для ввода даты или времени курсор устанавливается
         * перед первым символом, если поле не заполнено полностью, то после последнего введенного символа.". Контрол всегда
         * либо не заполнен, либо заполнен. Потому что по уходу фокуса пустые места заполняются нулями. Получается при фокусе
         * по tab курсор должен стоять в начале.
         */
        if (isTab) {
            const selection = {
                start: 0,
                end: 0
            };
            this._viewModel.selection = selection;
            this._updateSelection(selection);
        }

        super._focusInHandler.apply(this, args);
    }

    static getDefaultOptions(): object {
        const defaultOptions = Base.getDefaultOptions();
        defaultOptions.spellCheck = false;

        return defaultOptions;
    }

    static getOptionTypes(): object {
        const optionTypes = Base.getOptionTypes();

        optionTypes.value = descriptor(Object, null);
        optionTypes.mask = descriptor(String).oneOf([
            'HH:MM',
            'HHH:MM',
            'HHHH:MM',
            'HH:MM:SS',
            'HHH:MM:SS',
            'HHHH:MM:SS'
        ]).required();

        return optionTypes;
    }
}

export default TimeInterval;
