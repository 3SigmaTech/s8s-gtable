
import type * as google from './google-types';
export * from './google-types';

/**
 * If the API call returns an error, it will be of this type
 * 
 */ 
export type GoogleError = {
    code?: string;
    errno?: number;
    syscall?: string;
    message?: string;
    stack?: string;
};

/**
 * If the API call returns an "error as success", it will be of this type
 * 
 */ 
export type GoogleSuccessError = {
    error?: {
        code?: number;
        message?: string;
        status?: string;
        error_description?: string;
    }
}

/**
 * The error type used by the main S8S application when returning errors from the Google API.
 * This is not relevant to the use of GTable, save for how it is rolled into the custom TableData type
 * which is what is passed into this React component to render the table.
 */
export type GoogleAPIError = GoogleError | GoogleSuccessError;

/**
 * EnhancedSpreadsheet allows for the inclusion of pre-compiled table data (2D array of data from sheet and size attributes).
 * This is somewhat bespoke to the S8S backend, which will return only this metadata for other use cases.
 * It is not required to render a GTable. However, if `GTableSettings.creatematrix = true` then GTable will create
 * this metadata for you, and add it to the GTable.props.data object.
  */
export type EnhancedSpreadsheet = google.Spreadsheet & {
    data: any[][];
    numrows: number;
    numcols: number;
};

/**
 * Combined type allowing for handing either success or error response from S8S middleware.
 * We use an intersection type for easier downstream use of this combined result.
 *
 */
export type GoogleSpreadsheet = EnhancedSpreadsheet | GoogleAPIError;

/**
 * This type is used for compatibility.
 */
export type TableData = GoogleSpreadsheet;


