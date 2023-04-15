import type * as google from '../types/s8s-google-types';
import { GTableClasses } from '../jsx/GTable';
import type { GTableInputData } from './GTableContext';

export function inputClass(data?: google.CellData): string {
    if (!data) {
        return '';
    }
    let format = data.effectiveFormat;
    if (format == undefined || format.numberFormat == undefined || format.numberFormat.pattern == undefined) {
        return '';
    }

    let p = format.numberFormat.pattern;
    if (p.startsWith('"$"')) {
        return GTableClasses.currencyInput;
    }

    let t = format.numberFormat.type;
    if (t == "PERCENT") {
        return GTableClasses.percentInput;
    }
    return '';
}

export function inputStyle(style: { [key: string]: any }, cls: string) {
    // Takes cellStyle (style) and inferred input class (cls)
    // And updates style to apply to input

    let newstyle = { ...style };

    if (cls == GTableClasses.percentInput) {
        newstyle['paddingRight'] = "1.01em";
    }

    newstyle['border'] = 'none';
    newstyle['maxHeight'] = '';
    newstyle['height'] = '';
    newstyle['width'] = (
        parseFloat(newstyle['width'].replace('px', ''))
        - (parseInt(newstyle["borderLeft"], 10) || 1)
    ) + 'px';

    return newstyle;
}

export function cleanInput(value: string): string {
    // Remove non-digit characters that are a dash or period
    value = value.replace(/[^0-9\-\.]+/g, "");
    // Remove all but the first occurence of a period
    let values = value.split('.');
    if (values.length > 2) {
        value = values[0] + '.' + values.slice(1).join('');
    }
    // This regex does not work on iOS (and causes file read to fail) 
    // value = value.replace(/(?<=(.*\..*))\.\./g, "");
    // Remove all dashes that aren't at the start of the line
    value = value.replace(/(?!^)\-/g, "");

    return value;
}

export function addInputContext(inputs: GTableInputData[], address: string, value: number) {
    inputs.push({
        range: address,
        values: [[value]]
    });
}

export function removeInputContext(inputs: GTableInputData[], address: string) {
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i]?.range == address) {
            inputs.splice(i, 1);
        }
    }
}
