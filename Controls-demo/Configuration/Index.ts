import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls-demo/Configuration/ListEditor';
import 'css!Controls-demo/Controls-demo';
import {getEditingObject, getSource} from 'Controls-demo/PropertyGridNew/resources/Data';

interface IListEditorOptions extends IControlOptions {
    selectedKey: string;
}

export default class ListEditorDemo extends Control<IListEditorOptions> {
    protected _template: TemplateFunction = template;
    protected _selectedKey: string = 'tile';
    protected _tileTemplate: {
        templateName: 'wml!Controls-demo/Configuration/TileTemplate',
        templateOptions: {
            name: 'tile'
        },
        editorOptions: {
            editorSource:
        }
    };
    protected _tableTemplate: {
        templateName: 'wml!Controls-demo/Configuration/TableTemplate',
        templateOptions: {
            name: 'table'
        }
    };

    protected _beforeMount(options): void {
        this._editorValue = {};
        this._tileTemplate = {
            templateName: 'wml!Controls-demo/Configuration/TileTemplate',
            templateOptions: {
                name: 'tile'
            },
            editorOptions: {
                source: this.getTileEditorSource(),
                parentProperty: '������',
                nodeProperty: '������@',
                root: null
            }
        };
        this._listTemplate = {
            templateName: 'wml!Controls-demo/Configuration/ListTemplate',
            templateOptions: {
                name: 'list'
            },
            editorOptions: {
                source: this.getTileEditorSource(),
                parentProperty: '������',
                nodeProperty: '������@',
                root: null
            }
        };
        this._tableTemplate = {
            templateName: 'wml!Controls-demo/Configuration/TableTemplate',
            templateOptions: {
                name: 'tableTemplate'
            },
            editorOptions: {
                source: this.getTileEditorSource(),
                parentProperty: '������',
                nodeProperty: '������@',
                root: null
            }
        };
    }

    private getTileEditorSource(): any {
        return [
            {
                name: 'description',
                ������: null,
                '������@': true,
                caption: '��������',
                editorOptions: {
                    minLines: 3
                },
                editorClass: 'controls-demo-pg-text-editor',
                type: 'text'
            },
            {
                name: 'tileView',
                ������: 'description',
                '������@': false,
                caption: '������ �������'
            },
            {
                name: 'showBackgroundImage',
                ������: 'description',
                '������@': false,
                caption: '���������� �����������'
            },
            {
                caption: 'URL',
                name: 'siteUrl',
                ������: 'description',
                '������@': false
            },
            {
                caption: '�������� �����',
                name: 'videoSource',
                ������: 'description',
                '������@': false
            },
            {
                caption: '��� ����',
                name: 'backgroundType',
                ������: 'description',
                '������@': false,
                editorClass: 'controls-demo-pg-enum-editor'
            }
        ];
    }

    protected async _customizeClick(): Promise<string> {
        const popup = await import('Controls/popup');
        return popup.Stack.openPopup({
            template: 'Controls-demo/Configuration/CustomizePopup',
            width: 800
        });
    }
}
