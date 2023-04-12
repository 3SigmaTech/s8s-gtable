import type * as google from '../types/s8s-google-types';
import { GTableClasses } from '../jsx/GTable';
import type { GTableInputData } from './GTableContext';

class GTableMergeProps {
    startOfMerge?: boolean = false;
    inMerge?: boolean = false;
    context?: google.GridRange;
}; 

export function getDataSize(data:google.RowData[]):{numrows:number, numcols:number} {
    let size = {numrows: data.length, numcols: 0};

    for (let r = 0; r < size.numrows; r++) {
        let newc = data[r]?.values?.length;
        if (newc && newc > size.numcols) {
            size.numcols = newc;
        }
    }

    return size;
}

export function createMatrix(data: google.EnhancedSpreadsheet) {
    for (let r = 0; r < data.numrows; r++) { 
        data.data[r] = [];
        for (let c = 0; c < data.numcols; c++) {
            let celldata = data.sheets?.[0]?.data?.[0]?.rowData?.[r]?.values?.[c];
            if (celldata) {
                data.data[r]?.push(celldata);
            } else {
                data.data[r]?.push(null);
            }
        }
    }
}

export function checkMerges(merges: google.GridRange[], row: number, col: number) {
    let props = new GTableMergeProps();

    let mergeContext = merges.filter((m) => {
        return m.startRowIndex == row
            && m.startColumnIndex == col;
    });
    props.startOfMerge = (mergeContext.length > 0);
    if (props.startOfMerge) {
        props.context = { ...mergeContext[0] } as google.GridRange;
        // It is the start of a merge; we are clearly already in one
        return props;
    }

    mergeContext = merges.filter((m) => {
        return (m.startRowIndex || 0) <= row
            && (m.endRowIndex || 0) > row
            && (m.startColumnIndex || 0) <= col
            && (m.endColumnIndex || 0) > col;
    });
    props.inMerge = (mergeContext.length > 0);
    if (props.inMerge) {
        props.context = { ...mergeContext[0] };
    }
    return props;

}

export function rgbStr(rgb: google.Color) {
    if (rgb == undefined) {
        return '';
    }
    let r = (rgb.red ? 255 * rgb.red : 0);
    let g = (rgb.green ? 255 * rgb.green : 0);
    let b = (rgb.blue ? 255 * rgb.blue : 0);
    return `rgb(${r}, ${g}, ${b})`;
}

export function textStyle(textStyle?: google.TextFormat) {
    let style: { [key: string]: string } = {};

    if (!textStyle) {
        return style;
    }

    if (textStyle.foregroundColorStyle?.rgbColor != undefined) {
        style['color'] = rgbStr(textStyle.foregroundColorStyle.rgbColor);
    }
    if (textStyle.fontFamily != undefined) {
        style['fontFamily'] = textStyle.fontFamily;
    }
    if (textStyle.fontSize != undefined) {
        style['fontSize'] = `${textStyle.fontSize}pt`;
    }
    if (textStyle.bold != undefined && textStyle.bold) {
        style['fontWeight'] = 'bold';
    }
    if (textStyle.italic != undefined && textStyle.italic) {
        style['fontStyle'] = 'italic';
    }
    if (textStyle.strikethrough != undefined && textStyle.strikethrough) {
        style['textDecoration'] = 'line-through';
    }
    if (textStyle.underline != undefined && textStyle.underline) {
        style['textDecoration'] = 'underline';
    }
    return style;
}

export function cellStyle(
    data?: google.CellData,
    rowSize?: google.DimensionProperties,
    colSize?: google.DimensionProperties
) {
    let style: { [key: string]: string | null | undefined } = {};

    let format = data?.effectiveFormat;
    if (!format) {
        return style;
    }

    if (format.backgroundColorStyle?.rgbColor != undefined) {
        style['backgroundColor'] = rgbStr(format.backgroundColorStyle.rgbColor);
    } else if (format.backgroundColor != undefined) {
        style['backgroundColor'] = rgbStr(format.backgroundColor);
    }

    let ha = format.horizontalAlignment;
    if (ha != undefined) {
        style['textAlign'] = ha;
    }

    let va = format.verticalAlignment;
    if (va != undefined) {
        style['verticalAlign'] = va;
    }

    let padding = format.padding;
    if (padding != undefined) {
        for (const pad of Object.entries(padding)) {
            style[`padding${toTitleCase(pad[0])}`] = `${pad[1] || 0}px`;
        }
    }

    let borders = format.borders;
    if (borders) {
        for (const border of Object.entries(borders)) {
            let b = border[1];
            if (!b) {
                continue;
            }
            if (b.colorStyle?.rgbColor != undefined) {
                let bstring = `${(b.width || 0)}px ${(b.style || 'solid')} ${rgbStr(b.colorStyle.rgbColor)}`;
                style[`border${toTitleCase(border[0])}`] = bstring;
            }
        }
    }

    let text = format.textFormat;
    if (text != undefined) {
        Object.assign(style, textStyle(text));
    }

    if (format.wrapStrategy != undefined) {
        if (format.wrapStrategy == "OVERFLOW_CELL") {
            style['overflow'] = 'visible';
            style['whiteSpace'] = 'pre';
        }
        if (format.wrapStrategy == "CLIP") {
            style['overflow'] = 'hidden';
            style['whiteSpace'] = 'pre';
        }
        if (format.wrapStrategy == "WRAP") {
            style['whiteSpace'] = 'pre-wrap';
        }
    }

    if (rowSize) {
        let sz = (rowSize.pixelSize || 0);
        style['maxHeight'] = `${sz}px`;
        style['height'] = `${sz}px`;
    }

    if (colSize) {
        let sz = (colSize.pixelSize || 0);
        style['maxWidth'] = `${sz}px`;
        style['width'] = `${sz}px`;
    }

    return style;
}

export function rowStyle(rowMetadata?: google.DimensionProperties) {
    return {
        height: `${(rowMetadata?.pixelSize || 0)}px`
    };
};

export function columnStyle(columnMetadata?: google.DimensionProperties) {
    return {
        width: `${(columnMetadata?.pixelSize || 0)}px`
    };
}

export function columnToLetter(column: number): string {
    let temp, letter = '';
    while (column > 0) {
        temp = (column - 1) % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        column = (column - temp - 1) / 26;
    }
    return letter;
}

export function letterToColumn(letter: string): number {
    let column = 0, length = letter.length;
    for (let i = 0; i < length; i++) {
        column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
    }
    return column;
}

export function toTitleCase(str: string): string {
    return str.replace(
        /\w\S*/g,
        function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}