import type * as google from '../types/s8s-google-types';
import type { GTableInputData } from './GTableContext';
export declare function inputClass(data?: google.CellData): string;
export declare function inputStyle(style: {
    [key: string]: any;
}, cls: string): {
    [x: string]: any;
};
export declare function cleanInput(value: string): string;
export declare function addInputContext(inputs: GTableInputData[], address: string, value: number): void;
export declare function removeInputContext(inputs: GTableInputData[], address: string): void;
//# sourceMappingURL=GTableInputHelpers.d.ts.map