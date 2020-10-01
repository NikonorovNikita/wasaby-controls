import {Model, Record} from 'Types/entity';
import {SbisService, ICrudPlus} from 'Types/source';
import {Logger} from 'UI/Utils';
import {ISelectionObject} from 'Controls/interface';
import {Confirmation, Dialog, IBasePopupOptions} from 'Controls/popup';
import * as rk from 'i18n!*';

import {IHashMap} from 'Types/declarations';
import {IMoverDialogTemplateOptions} from 'Controls/moverDialog';
import {CrudEntityKey} from 'Types/source';

// @todo https://online.sbis.ru/opendoc.html?guid=2f35304f-4a67-45f4-a4f0-0c928890a6fc
type TSource = SbisService|ICrudPlus;
type TFilterObject = IHashMap<any>;

type TValidationResult = {
    message: string;
    isError: boolean;
};

/**
 * Интерфейс опций контроллера
 * @interface Controls/_list/interface/IMoveControllerOptions
 * @public
 * @author Аверкиев П.А.
 */
export interface IMoveControllerOptions {
    /**
     * @name Controls/_list/interface/IMoveControllerOptions#source
     * @cfg {TSource} Ресурс, в котором производится перемещение
     */
    source: TSource;
    /**
     * @name Controls/_list/interface/IMoveControllerOptions#parentProperty
     * @cfg {String} Имя поля, содержащего идентификатор родительского элемента.
     */
    parentProperty: string;
    /**
     * @name Controls/_list/interface/IMoveControllerOptions#popupOptions
     * @cfg {Controls/popup:IBasePopupOptions} опции диалога перемещения
     */
    popupOptions?: IBasePopupOptions
}

/**
 * @typedef {String} TMovePosition
 * @description
 * Позиция для перемещения записи
 */
export enum TMovePosition {
    on = 'on',
    before = 'before',
    after = 'after'
}

/**
 * Контроллер для перемещения элементов списка.
 *
 * @class Controls/_mover/MoveController
 * @control
 * @public
 * @author Аверкиев П.А
 */
export class MoveController {

    // Опции диалога перемещения записей
    protected _popupOptions: IBasePopupOptions;

    // Ресурс данных, в котором производится смена мест
    private _source: TSource;

    // Имя свойства, хранящего ключ родителя в дереве, необходим для _moveInSource
    protected _parentProperty: string;

    constructor(options: IMoveControllerOptions) {
        this.updateOptions(options);
    }

    /**
     * Обновляет параметры контроллера
     * @function Controls/_list/Controllers/MoveController#updateOptions
     * @param {Controls/_list/interface/IMoveControllerOptions} options
     */
    updateOptions(options: IMoveControllerOptions): void {
        this._popupOptions = options.popupOptions;
        this._source = options.source;
        this._parentProperty = options.parentProperty;
    }

    /**
     * Перемещает переданные элементы относительно указанного целевого элемента или в указанную папку.
     * @function Controls/_list/Controllers/MoveController#move
     * @param {Controls/interface:ISelectionObject} selection Элементы для перемещения.
     * @param {TFilterObject} filter Дополнительный фильтр для перемещения в папку через SbisService.
     * @param {Types/source:CrudEntityKey} targetKey Идентификатор целевой записи, относительно которой позиционируются
     * перемещаемые записи или идентификатор папки, в которую происходит перемещение.
     * @param {TMovePosition} position Положение перемещения.
     * @returns {Promise} Отложенный результат перемещения.
     * @remark
     * В зависимости от аргумента 'position' элементы могут быть перемещены до, после или на указанный целевой элемент.
     * @see moveUp
     * @see moveDown
     */
    move(selection: ISelectionObject, filter: TFilterObject = {}, targetKey: CrudEntityKey, position: TMovePosition): Promise<void> {
        return this._moveInSource(selection, filter, targetKey, position);
    }

    /**
     * Перемещение переданных элементов с предварительным выбором родительского узла с помощью диалогового окна.
     * @function Controls/_list/Controllers/MoveController#moveWithDialog
     * @param {Controls/interface:ISelectionObject} selection Элементы для перемещения.
     * @param {TFilterObject} filter дополнительный фильтр для перемещения в SbisService.
     * @see moveUp
     * @see moveDown
     * @see move
     */
    moveWithDialog(selection: ISelectionObject, filter: TFilterObject = {}): Promise<void> {
        const validationResult = MoveController._validateBeforeOpenDialog(selection, this._popupOptions);
        if (!validationResult.message) {
            return this._openMoveDialog(selection, filter);
        } else if (!validationResult.isError) {
            Confirmation.openPopup({
                type: 'ok',
                message: rk('Нет записей для обработки команды')
            });
            return Promise.reject();
        }
        Logger.error(validationResult.message);
        return Promise.reject(new Error(validationResult.message));
    }

    /**
     * Открывает диалог перемещения
     * @param {Controls/interface:ISelectionObject} selection Элементы для перемещения.
     * @param {TFilterObject} filter дополнительный фильтр для перемещения в SbisService.
     * @private
     */
    private _openMoveDialog(selection: ISelectionObject, filter?: TFilterObject): Promise<void> {
        const templateOptions: IMoverDialogTemplateOptions = {
            movedItems: selection.selected,
            source: this._source,
            ...(this._popupOptions.templateOptions as IMoverDialogTemplateOptions)
        };

        return new Promise((resolve) => {
            Dialog.openPopup({
                opener: this._popupOptions.opener,
                templateOptions,
                closeOnOutsideClick: true,
                template: this._popupOptions.template,
                eventHandlers: {
                    onResult: (target: Model) => {
                        // null при перемещении записей в корень
                        const targetKey = target === null ? target : target.getKey();
                        resolve(this._moveInSource(selection, filter, targetKey, TMovePosition.on))
                    }
                }
            });
        });
    }

    /**
     * Перемещает элементы в ICrudPlus
     * @param {Controls/interface:ISelectionObject} selection Элементы для перемещения.
     * @param {TFilterObject} filter дополнительный фильтр для перемещения в папку в SbisService.
     * @param {Types/source:CrudEntityKey} targetKey Идентификатор целевой записи, относительно которой позиционируются перемещаемые.
     * @param position
     * @private
     */
    private _moveInSource(selection: ISelectionObject, filter: TFilterObject = {}, targetKey: CrudEntityKey, position: TMovePosition): Promise<void>  {
        const error: string = MoveController._validateBeforeMove(this._source, selection, filter, targetKey, position);
        if (error) {
            Logger.error(error);
            return Promise.reject(new Error(error));
        }
        /**
         * https://online.sbis.ru/opendoc.html?guid=2f35304f-4a67-45f4-a4f0-0c928890a6fc
         * При использовании ICrudPlus.move() мы не можем передать filter и folder_id, т.к. такой контракт
         * не соответствует стандартному контракту SbisService.move(). Поэтому здесь вызывается call
         */
        if ((this._source as SbisService).call && position === TMovePosition.on) {
            const source: SbisService = this._source as SbisService;
            return new Promise((resolve) => {
                import('Controls/operations').then((operations) => {
                    const sourceAdapter = source.getAdapter();
                    const callFilter = {
                        ...filter,
                        selection: operations.selectionToRecord(selection, sourceAdapter)
                    };
                    source.call(source.getBinding().move, {
                        method: source.getBinding().list,
                        filter: Record.fromObject(callFilter, sourceAdapter),
                        folder_id: targetKey
                    }).then(() => {
                        resolve();
                    });
                });
            })
        }
        return this._source.move(selection.selected, targetKey, {
            position,
            parentProperty: this._parentProperty
        });
    }

    /**
     * Перемещает элементы в ICrudPlus
     * @param {TSource} source Ресурс данных
     * @param {Controls/interface:ISelectionObject} selection Элементы для перемещения.
     * @param {TFilterObject} filter дополнительный фильтр для перемещения в папку в SbisService.
     * @param {Types/source:CrudEntityKey} targetKey Идентификатор целевой записи, относительно которой позиционируются перемещаемые.
     * @param position
     * @private
     */
    private static _validateBeforeMove(
        source: TSource,
        selection: ISelectionObject,
        filter: TFilterObject,
        targetKey: CrudEntityKey,
        position: TMovePosition): string {
        let error: string;
        if (!source) {
            error = 'MoveController: Source is not set';
        }
        if (!selection || (!selection.selected && !selection.excluded)) {
            error = 'MoveController: Selection type must be Controls/interface:ISelectionObject';
        }
        if (typeof filter !== "object") {
            error = 'MoveController: Filter must be plain object';
        }
        if (targetKey === undefined) {
            error = 'MoveController: Target key is undefined';
        }
        if ([TMovePosition.on, TMovePosition.after, TMovePosition.before].indexOf(position) === -1) {
            error = 'MoveController: position must correspond with TMovePosition type';
        }
        return error;
    }

    /**
     * Производит проверку переданного объекта с идентификаторами элементов для перемещения.
     * Если список идентификаторов пуст, возвращает false и выводит окно с текстом, иначе возвращает true.
     * @function
     * @name Controls/_list/Controllers/MoveController#_validateBeforeOpenDialog
     * @private
     */
    private static _validateBeforeOpenDialog(selection: ISelectionObject, popupOptions: IBasePopupOptions): TValidationResult {
        let result: TValidationResult = {
            message: null,
            isError: false
        }
        if (!popupOptions.template) {
            result.message = 'MoveController: MoveDialogTemplate option is undefined';
            result.isError = true;
        } else if (!selection || (!selection.selected && !selection.excluded)) {
            result.message = 'MoveController: Selection type must be Controls/interface:ISelectionObject';
            result.isError = true;
        } else if (selection.selected && !selection.selected.length) {
            result.message = rk('Нет записей для обработки команды');
        }
        return result;
    }
}
