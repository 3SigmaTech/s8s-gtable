
# Overview

This package creates a React-rendering of a Google Spreadsheet into HTML Table.
You will need to write your own back-end / api integration to make this work.
See [Implementation](#implementation) for more details there.

![Google Sheet](/man/img/GoogleSheet.png "The Google Sheet")
![GTable](/man/img/RenderedTable.png "The Rendered GTable")
![Updated Inputs](/man/img/MultipleInputs.png "Updated, but unsubmitted, inputs")



# Settings

To save myself some writing, I've copied/pasted the documentation from the `/src/js/GTableContext.ts` file:
```javascript
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
```

# Implementation

You will need to have created a [Google OAuth2 client](https://www.npmjs.com/package/googleapis?activeTab=readme#oauth2-client) to access the [Sheets API](https://developers.google.com/sheets/api/guides/concepts). I will omit these steps here and assume you've done so. Using the backend from the S8S project (not yet open source) as an example for how to retrieve data from a google sheet.

Some notes:
 - Do not use the `fields` setting to create a [partial response](https://developers.google.com/sheets/api/guides/performance#partial) as GTable uses nearly every returned resource).
 - The below code snippets are incomplete, but sufficient for reference. (With the exception of the `leftToTheReader()` function to define the access token it _might_ be complete but it has not been tested.)


## Front-end

```javascript

import { Tooltip } from 'bootstrap';
import type * as google from '../../shared/s8s-google-types';
import { renderGTable, GTableSettings } from 's8s-gtable';

function getTable() {
    let settings = {
        method: 'GET',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    };

    fetch('/route/to/table', settings).then((resp) => {
        return resp.json();
    }).then((data) => {
        drawTable('data-table-container', data);
    });

}
getTable();

function drawTable(tbl: string, data: google.GoogleSpreadsheet) {
    let settings = new GTableSettings();
    settings.columnTabbing = true; // S8S tables have column-oriented input "forms"

    // S8S tables use boostrap tooltips
    settings.effects = [
        () => {
            var ttTriggerList = Array.prototype.slice.call(
                document.querySelectorAll('[data-toggle="tooltip"]')
            );
            /*var tooltipList =*/ ttTriggerList.map(function (ttTriggerEl) {
                return new Tooltip(ttTriggerEl)
            });
        }
    ];

    // S8S uses yellow backgrounds to denote user-editable cell values
    settings.configurable = (data?: google.CellData) => {
        if (!data) { return false; }
        let bgStyle = data.effectiveFormat?.backgroundColorStyle?.rgbColor;
        let bgColor = data.effectiveFormat?.backgroundColor;
        return (bgColor?.red == 1 && bgColor?.green == 1 && (bgColor?.blue || 0) == 0)
            || (bgStyle?.red == 1 && bgStyle?.green == 1 && (bgStyle?.blue || 0) == 0);
    };

    renderGTable(tbl, data, settings);
}
```


## Back-end (Node.js)
```javascript

import https from 'https';
import type {Express, Request, Response} from 'express';
// The below should import the types from the src directory of this repo
import type * as google from '../../shared/s8s-google-types';

export class SheetSettings {
    accessToken:string = '';
    sheetId:string = '';
    range:string|string[] = [];
};
export class GetSheetSettings extends SheetSettings {
    fields?:string;
};
export class SetSheetSettings extends SheetSettings {
    /* TODO: document why this paramater exists */
    rangevalues?:any[];
    values?:any[];
};

export default function(app:Express) {

    app.get('/route/to/table', (req:Request, res:Response) => {
        getData(req, res);
    });

    // This route will become relevent later
    app.post('/route/to/table', jsonParser, (req:Request, res:Response) => {
        sendData(req, res);
    });
}

function getData(req:Request, res:Response) {
    let gSheet = 'some-sheet-id';
    
    let settings = new GetSheetSettings();
    settings.accessToken = leftToTheReader(); // This function must be written
    settings.sheetId = gSheet;
    settings.range = 'A1:D100'; // Can also use named ranges which I HIGHLY recommend

    getSheetData(settings).then((gMetaData:google.GoogleSpreadsheet) => {
        res.set('Content-Type', 'application/json');
        res.send(gMetaData);
    }).catch((err) => {
        // Left to the reader
    });
}

function getSheetData(settings:GetSheetSettings):Promise<google.TableData> {
    let rangeQuery = '&ranges=';
    if (Array.isArray(settings.range)) {
        rangeQuery = settings.range.join('&ranges=');
    } else {
        rangeQuery += settings.range;
    }

    let fieldsQuery = '';
    if (settings.fields != undefined) {
        fieldsQuery = '&fields=' + settings.fields;
    }
    var options = {
        method: 'GET',
        host: 'sheets.googleapis.com',
        path: '/v4/spreadsheets/' + settings.sheetId + '?includeGridData=true' + rangeQuery + fieldsQuery,
        headers: {
            'Authorization': 'Bearer ' + settings.accessToken
        }
    };

    return new Promise<google.TableData>((resolve, reject) => {
        const req = https.request(options, (res) => {
            console.log(`${options.host}${options.path} : ${res.statusCode} (${res.statusMessage})`);
            var datastr = '';
            res.on('data', (data) => {
                datastr += data;
            });
            res.on('end', () => {
                let data = JSON.parse(datastr);

                if (isSuccess(data)) {
                    resolve(data); // <-- This object will have a Spreadsheet data type
                                   //     (found in src/types/google-types.d.ts)
                } else {
                    reject(data.error); // <-- This object will have a GoogleAPIError data type
                                        //     (found in src/types/s8s-google-types.d.ts)
                }
            });
        });
        req.on('error', (err:types.GoogleError) => { reject(err); });
        req.end();
    });
};
```

## Handling Updates
You can handle updates to your configurable cells by providing a `settings.submitHandler` value. An example implementation follows.

Add the following to wherever you created your `GTableSettings`.
```javascript
// Put this wherever you created your settings object:
settings.submitHandler = (data?:GTableInputData[]) => {
    if (!data) { return; }
    let settings = {
        method: 'POST',
        credentials: "include" as RequestCredentials,
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        }
    };
    fetch('/forecaster/update', settings).then((_resp:Response) => {
        getData();
    });
};
```

Update your back-end implementation with the below:
```javascript

function sendData(req:Request, res:Response) {
    let gSheet = getSheetId(req);
    
    let settings = new google.SetSheetSettings();
    settings.accessToken = leftToTheReader(); // This function must be written
    settings.sheetId = gSheet;
    settings.rangevalues = req.body;

    // TODO: update range + values so they needn't be defined by the front-end
    setSheetData(settings).then((_data) => {
        res.send('success');
    }).catch((err) => {
        // Left to the reader
    });
}

function setSheetData(settings:SetSheetSettings) {
    var options = {
        method: 'POST',
        host: 'sheets.googleapis.com',
        path: '/v4/spreadsheets/' + settings.sheetId + '/values:batchUpdate',
        headers: {
            'Authorization': 'Bearer ' + settings.accessToken,
            'Content-Type': 'application/json'
        }
    };
    let data = [];
    if (settings.rangevalues != undefined) {
        data = settings.rangevalues;
    } else {
        // This path is useful for updating one cell or contiguous range at a time
        data = [{
            range: settings.range,
            values: settings.values
        }];
    }

    let post_data = {
        valueInputOption: "USER_ENTERED",
        data: data,
        includeValuesInResponse: false
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            console.log(`${options.host}${options.path} : ${res.statusCode}`);
            res.setEncoding('utf8');

            var datastr = '';
            res.on('data', (data) => {
                datastr += data;
            });
            res.on('end', () => {
                let data = JSON.parse(datastr);
                if (isSuccess(data)) {
                    resolve(data);
                } else {
                    console.log(`ERROR IN POST: ${post_data}`);
                    reject(data.error);
                }
            });
        });
        req.on('error', (err:GoogleError) => { errHandler(err, reject); });
        req.write(JSON.stringify(post_data));
        req.end();
    });
};

```