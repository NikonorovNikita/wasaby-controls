/**
 * Интерфейс для поддержки перехода на новую строку в поле ввода.
 * @interface Controls/_input/interface/INewLineKey
 * @public
 * @author Красильников А.С.
 */

/*
 * Input new line key interface
 * @interface Controls/_input/interface/INewLineKey
 * @public
 * @author Красильников А.С.
 */
interface INewLineKey {
    readonly _options: {
        /**
         * @name Controls/_input/interface/INewLineKey#newLineKey
         * @cfg {Enum} Поведение при создании новой строки.
         * @variant enter Пользователь нажимает клавишу "Enter".
         * @variant ctrlEnter Пользователь нажимает комбинацию клавиш "Ctrl + Enter".
         * @default enter
         */

        /*
         * @name Controls/_input/interface/INewLineKey#newLineKey
         * @cfg {Enum} The behavior of creating a new line.
         * @variant enter When user presses Enter.
         * @variant ctrlEnter When user presses Ctrl + Enter.
         * @default enter
         */
        newLineKey: 'enter' | 'ctrlEnter';
    };
}

export default INewLineKey;
