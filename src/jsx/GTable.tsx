
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import type * as google from '../types/s8s-google-types';

import * as helpers from '../js/GTableHelpers';
import { inputClass } from '../js/GTableInputHelpers';
export { columnToLetter, letterToColumn } from '../js/GTableHelpers';

import { GTableSettings, GTableContext, ClassContext, TableContext} from '../js/GTableContext';
export { GTableSettings, classes as GTableClasses, GTableInputData } from '../js/GTableContext';

import GTableCellInput from './GTableInput';


export function renderGTable(tbl: string, data: google.TableData, settings?: GTableSettings) {
    // Just in case
    tbl = tbl.replace('#', '');

    if ("error" in data) {
        return ;
    }
    data = data as google.EnhancedSpreadsheet;


    if (settings?.createmaxtrix) {
        let { numrows, numcols } = helpers.getDataSize(
            data.sheets?.[0]?.data?.[0]?.rowData || []
        );
        data.numrows = numrows;
        data.numcols = numcols;
        helpers.createMatrix(data);
    }

    // @ts-ignore - There is a weird typing issue with createRoot
    // And I've already wasted an hour trying to figure it out
    // Something about using react-dom/client...which causes browser error
    const root = ReactDOM.createRoot(
        document.getElementById(tbl) as HTMLElement
    );
    root.render(<GTable data={data} settings={settings as GTableSettings} />);
}

export default GTable;
export function GTable(props:{
    data: google.TableData, settings?:GTableSettings
}) {

    const classes = React.useContext(ClassContext);

    if ("error" in props.data) {
        return (
            <table className={classes.table + ' ' + classes.error}>
            </table>
        );
    }

    props.data = props.data as google.EnhancedSpreadsheet;

    // Restructure input data to be more transparently available in components
    let data = props.data.sheets?.[0]?.data?.[0]?.rowData || [];
    let rowSizes = props.data.sheets?.[0]?.data?.[0]?.rowMetadata || [];
    let colSizes = props.data.sheets?.[0]?.data?.[0]?.columnMetadata || [];
    let merges = props.data.sheets?.[0]?.merges || [];
    let settings = props.settings || new GTableSettings();

    let numrows = props.data.numrows;
    let numcols = props.data.numcols;

    if (!numrows || !numcols) {
        ({numrows, numcols} = helpers.getDataSize(data));
    }

    // I know this will make things more difficult to trace
    // But assume all props/context not shown in component instantiation
    // is created here (all subsequent components will use some piece of this)
    const context:GTableContext = {
        settings: settings,
        numrows: numrows,
        numcols: numcols,
        rowSizes: rowSizes,
        colSizes: colSizes,
        data: data,
        merges: merges
    };
    
    for (let i = 0; i < settings.effects.length; i++) {
        React.useEffect(settings.effects[i] as React.EffectCallback);
    }

    return (
        <TableContext.Provider value={context}>
        <table className={classes.table}>
            <GTableHeader />
            <GTableBody />
        </table>
        </TableContext.Provider>
    );
}

function GTableHeader() {

    const classes = React.useContext(ClassContext);
    const context = React.useContext(TableContext);
    
    const headers:JSX.Element[] = [];

    for (let c = 0; c < context.numcols; c++) {
        let mystyle = helpers.columnStyle(context.colSizes[c]);
        headers.push(
            <th className={classes.th} style={mystyle}>
                {helpers.columnToLetter(c + 1)}
            </th>
        );
    }

    return (
        <thead className={classes.thead}>
            {headers}
        </thead>
    );
}

function GTableBody() {

    const classes = React.useContext(ClassContext);
    const context = React.useContext(TableContext);

    const rows: JSX.Element[] = [];

    for (let r = 0; r < context.numrows; r++) {
        if (!context.data[r]) {
            continue;
        }
        rows.push(
            <GTableRow row={r} />
        );
    }


    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            context.settings.submitHandler();
        }
    }


    return (
        <tbody
            className={classes.tbody}
            onKeyDown={handleKeyDown}
        >
            {rows}
        </tbody>
    );

}

function GTableRow(props:{row:number}) {

    const classes = React.useContext(ClassContext);
    const context = React.useContext(TableContext);

    
    const cells: JSX.Element[] = [];

    for (let c = 0; c < context.numcols; c++) {
        cells.push(
            <GTableCell row={props.row} col={c} />
        );
    }

    let rowstyle = helpers.rowStyle(context.rowSizes[props.row]);

    return (
        <tr className={classes.tr} style={rowstyle}>
            {cells}
        </tr>
    );
    
}

function GTableCell(props:{row:number, col:number}) {

    const classes = React.useContext(ClassContext);
    const context = React.useContext(TableContext);
    
    let {row, col} = props;
    let data = context.data[row]?.values?.[col] as google.CellData;
    let rowSize = context.rowSizes[row];
    let colSize = context.colSizes[col];

    let style:{[key:string]:any} = {};
    let attrs:{[key:string]:any} = {};
    let myclass = classes.td;


    // Check if in active merge, which means we should return null
    // We will not be adding anything to the DOM for cells within merge
    let merge = helpers.checkMerges(context.merges, row, col);
    if (merge.inMerge && !merge.startOfMerge) {
        return null;
    }

    style = helpers.cellStyle(data, rowSize, colSize);

    if (merge.startOfMerge) {
        let m = merge.context as google.GridRange;
        attrs['colspan'] = (m.endColumnIndex || 0) - (m.startColumnIndex || 0);
        attrs['rowspan'] = (m.endRowIndex || 0) - (m.startRowIndex || 0);
    }

    attrs['data-range'] = helpers.columnToLetter(col + 1) + (row + 1);
    attrs['data-col'] = col;
    attrs['data-row'] = row;

    let children:JSX.Element[] = [];
    if (!context.settings.configurable(data)) {
        children.push(
            <GTableCellData 
                data={data}
            />
        );
    } else {
        children.push(
            <GTableCellInput
                data={data}
                style={{...style}}
                row={row}
                col={col}
                address={attrs['data-range']}
            />
        );
        myclass += (' ' + inputClass(data));
        // // Update styling to allow for wall-to-wall input
        // let cls = helpers.inputClass(data);
        // if (cls) {
        //     myclass += (' ' + cls);
        // }
        style['padding'] = '0';
        style['background-color'] = 'red'

    }

    // Add attributes to support bootstrap (etc.) tooltips
    if (data?.note) {
        attrs['title'] = data.note;
        attrs['data-toggle'] = 'tooltip';
        // TODO: get smart about placement by looking for adjacent blank values
    }

    return (
        <td className={myclass} style={style} {...attrs}>
            {children}
        </td>
    );
}

function GTableCellData(props: { data: google.CellData }) {
    if (!props.data) {
        return <></>;
    } else if (props.data.textFormatRuns == undefined) {
        return <>{props.data.formattedValue || ''}</>;
    } else {
        let cellContents:JSX.Element[] = [];
        let lasti = props.data.textFormatRuns.length - 1;
        for (let i = 0; i <= lasti; i++) {
            let format = props.data.textFormatRuns[i]?.format;
            let mystr = props.data.formattedValue || '';

            let startindex = (i == 0 ? 0 : (props.data.textFormatRuns[i]?.startIndex || 0));
            let endindex = (i == lasti ? mystr.length : (props.data.textFormatRuns[i + 1]?.startIndex || 0) - 1);

            mystr = mystr.slice(startindex, endindex);

            let pstyle = helpers.textStyle(format);

            let nextEl = <p style={pstyle}></p>;
            nextEl.props.children = [];
            if (format?.link?.uri) {
                nextEl.props.children.push(
                    <a href={format.link.uri} target="_blank">
                        {mystr}
                    </a>
                );
            } else {
                nextEl.props.children.push(
                    <>{mystr}</>
                );
            }
            cellContents.push(nextEl);
        }
        return <>{cellContents}</>;
    }
}
