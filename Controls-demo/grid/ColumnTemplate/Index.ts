import {Control, TemplateFunction} from "UI/Base";
import * as Template from "wml!Controls-demo/grid/ColumnTemplate/ColumnTemplate";
import * as withBackgroundColorStyle from "wml!Controls-demo/grid/ColumnTemplate/withBackgroundColorStyle";
import {Memory} from "Types/source";
import {getCountriesStats} from '../DemoHelpers/DataCatalog';
import {IColumn} from "../../../Controls/_grid/interface/IColumn";

interface IColorColumn extends IColumn {
    getColor?: (number) => string;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColorColumn[] = getCountriesStats().getColumnsWithoutWidths();

    protected _beforeMount() {
        const populationColumn = this._columns.find((column) => column.displayProperty === 'populationDensity');
        populationColumn.template = withBackgroundColorStyle;
        populationColumn.getColor = function(populationDensity) {
            if (populationDensity > 100) {
                return 'danger';
            }
            if (populationDensity < 10) {
                return 'warning';
            }

            return 'success';
        }

        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
