import type * as google from '../types/s8s-google-types';
export { columnToLetter, letterToColumn } from '../js/GTableHelpers';
import { GTableSettings } from '../js/GTableContext';
export { GTableSettings, classes as GTableClasses, GTableInputData } from '../js/GTableContext';
export declare function renderGTable(tbl: string, data: google.TableData, settings?: GTableSettings): void;
export default GTable;
export declare function GTable(props: {
    data: google.TableData;
    settings?: GTableSettings;
}): JSX.Element;
//# sourceMappingURL=GTable.d.ts.map