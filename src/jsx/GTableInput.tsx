
import * as React from 'react';
import type * as google from '../types/s8s-google-types';

import * as helpers from '../js/GTableInputHelpers';

import { ClassContext, TableContext, InputContext } from '../js/GTableContext';
import { GTableClasses } from './GTable';


export default function GTableCellInput(props: {
    data: google.CellData,
    style: { [key: string]: any },
    row: number,
    col: number,
    address: string
}) {
    // TODO - SUPPORT TEXT INPUTS AS WELL (only number inputs supported)

    // TODO - SET UP KEYBOARD NAVIGATION WITH KEY BINDING

    const classes = React.useContext(ClassContext);
    const context = React.useContext(TableContext);
    const inputs = React.useContext(InputContext);

    let v = (props.data?.effectiveValue?.numberValue || 0);
    let cls = helpers.inputClass(props.data);
    if (cls == GTableClasses.currencyInput) {
        v = parseFloat(v.toFixed(2));
    }
    if (cls == GTableClasses.percentInput) {
        v = parseFloat((100 * v).toFixed(6));
        props.style['paddingRight'] = "1.01em";
    }
    let style = helpers.inputStyle(props.style, cls);


    let [originalValue,] = React.useState(v);
    let [value, setValue] = React.useState(v.toString());
    let [savestate, setSaveState] = React.useState('');

    const handleChange = (event: React.ChangeEvent) => {

        let newvalstr = helpers.cleanInput(
            (event.target as HTMLInputElement).value
        );
        
        let newvalue = newvalstr ? parseFloat(newvalstr) : 0;
        if (newvalue != originalValue) {
            setSaveState(classes.dirtyInput);
            if (cls == classes.percentInput) {
                // Divide value by 100 before caching
                // As Sheets API takes percents as float
                // (Meaning 25% should be passed as 0.25)
                newvalue /= 100;
            }
            helpers.addInputContext(inputs, props.address, newvalue);
        } else {
            setSaveState('');
            helpers.removeInputContext(inputs, props.address);

        }

        setValue(newvalstr);
    }

    const handleFocus = (event: (React.FocusEvent | React.MouseEvent)) => {
        (event.target as HTMLInputElement).select();
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            context.settings.submitHandler(inputs);
        }
    }

    return (
        <input
            className={classes.input + ' ' + cls + ' ' + savestate}
            style={style}
            data-orig={v}
            value={value}
            tabIndex={(context.settings.columnTabbing ? props.col : props.row)}
            onChange={handleChange}
            onFocus={handleFocus}
            onClick={handleFocus}
            onKeyDown={handleKeyDown}
        />
    );


}

