import * as React from 'react';
import type * as google from '../types/s8s-google-types';
export declare const classes: {
    error: string;
    table: string;
    thead: string;
    th: string;
    tbody: string;
    tr: string;
    td: string;
    input: string;
    dirtyInput: string;
    currencyInput: string;
    percentInput: string;
};
export declare class GTableSettings {
    columnTabbing: boolean;
    effects: React.EffectCallback[];
    configurable: ((cellData?: google.CellData) => boolean);
    submitHandler: ((data?: GTableInputData[]) => void);
    createmaxtrix: boolean;
}
export declare class GTableContext {
    settings: GTableSettings;
    numrows: number;
    numcols: number;
    rowSizes: google.DimensionProperties[];
    colSizes: google.DimensionProperties[];
    data: google.RowData[];
    merges: google.GridRange[];
}
export declare class GTableInputData {
    range: string;
    values: any[][];
}
export declare const ClassContext: React.Context<{
    error: string;
    table: string;
    thead: string;
    th: string;
    tbody: string;
    tr: string;
    td: string;
    input: string;
    dirtyInput: string;
    currencyInput: string;
    percentInput: string;
}>;
export declare const TableContext: React.Context<GTableContext>;
export declare const InputContext: React.Context<GTableInputData[]>;
//# sourceMappingURL=GTableContext.d.ts.map