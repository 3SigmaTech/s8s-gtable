import type * as google from '../types/s8s-google-types';
declare class GTableMergeProps {
    startOfMerge?: boolean;
    inMerge?: boolean;
    context?: google.GridRange;
}
export declare function getDataSize(data: google.RowData[]): {
    numrows: number;
    numcols: number;
};
export declare function createMatrix(data: google.EnhancedSpreadsheet): void;
export declare function checkMerges(merges: google.GridRange[], row: number, col: number): GTableMergeProps;
export declare function rgbStr(rgb: google.Color): string;
export declare function textStyle(textStyle?: google.TextFormat): {
    [key: string]: string;
};
export declare function cellStyle(data?: google.CellData, rowSize?: google.DimensionProperties, colSize?: google.DimensionProperties): {
    [key: string]: string | null | undefined;
};
export declare function rowStyle(rowMetadata?: google.DimensionProperties): {
    height: string;
};
export declare function columnStyle(columnMetadata?: google.DimensionProperties): {
    width: string;
};
export declare function columnToLetter(column: number): string;
export declare function letterToColumn(letter: string): number;
export {};
//# sourceMappingURL=GTableHelpers.d.ts.map