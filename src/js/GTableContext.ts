import * as React from 'react';

import type * as google from '../types/s8s-google-types';

export const classes = {
    error: 'gtable-error',
    table: 'gtable',
    thead: 'gtable-head',
    th: 'gtable-column-head',
    tbody: 'gtable-body',
    tr: 'gtable-row',
    td: 'gtable-cell',
    input: 'gtable-input',
    dirtyInput: 'gtable-unsaved-changes',
    currencyInput: 'gtable-currency',
    percentInput: 'gtable-percentage'
};

export class GTableSettings {
    /**
     * Set this to true to chane to "column-major" tabbing through inputs.
     * TRUE: Using the TAB key will go down a column, then to the next one.
     * FALSE: Using the TAB key will go across a row, then to the next one.
     */
    columnTabbing = false;

    /**
     * An array of functions to add to the tables behavior (added with React.useEffect).
     * This allows for conditionally enabling tooltips
     * (and consequently removing the bootstrap dependency from this project)
     */
    effects: React.EffectCallback[] = [];
    
    /**
     * This function allows you define _what_ criteria makes a cell editable.
     * Trivially, you can always return false (default) for read-only,
     * or return true for a fully editable spreadsheet.
     */
    configurable: ((cellData?: google.CellData) => boolean) = (() => { return false; });
    
    /**
     * When the end-user presses enter an array of updated values (from configurable cells)
     * will be passed to this handler.
     * These values can be passed straight to the Google Sheets API as is.
     * The handler needs to optionally accept an array of objects with two properties:
     *   - range: the address of the updated cell, e.g. A1
     *   - values: A 2D array of the value of updated cell, e.g. [[0]]
     */
    submitHandler: ((data?:GTableInputData[]) => void) = (() => { return; });
    
    /**
     * If set to true, calls to GTable.renderGTable will add properties for
     *   - numrows: the number of rows in the spreadsheet data
     *   - numcols: the number of columns in the spreadsheet data
     *   - data: a 2D array of values from the spreadsheet
     */
    createmaxtrix = false;
};

export class GTableContext {
    settings: GTableSettings = new GTableSettings();
    numrows: number = 0;
    numcols: number = 0;
    rowSizes: google.DimensionProperties[] = [];
    colSizes: google.DimensionProperties[] = [];
    data: google.RowData[] = [];
    merges: google.GridRange[] = [];
};


export class GTableInputData {
    range:string = '';
    values:any[][] = [[]];
};

export const ClassContext = React.createContext(classes);
export const TableContext = React.createContext(new GTableContext());
export const InputContext = React.createContext<GTableInputData[]>([]);