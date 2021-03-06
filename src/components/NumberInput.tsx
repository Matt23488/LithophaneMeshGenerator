import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa'
import { clamp } from '../utilities';

import './css/NumberInput.css';

const NumberInput: React.FC<NumberInputProperties> = props => {
    const min = props.min ?? -Infinity;
    const max = props.max ?? Infinity;
    const step = props.step ?? 1;

    const { onValueChanged, value } = props;

    const onIncrement = useCallback(() => {
        onValueChanged(Math.min(max, value + step));
    }, [onValueChanged, value, max, step]);

    const onDecrement = useCallback(() => {
        onValueChanged(Math.max(min, value - step));
    }, [onValueChanged, value, min, step]);

    const onFastIncrement = useCallback(() => {
        onValueChanged(Math.min(max, value + step * 10));
    }, [onValueChanged, value, max, step]);

    const onFastDecrement = useCallback(() => {
        onValueChanged(Math.max(min, value - step * 10));
    }, [onValueChanged, value, min, step]);

    const precision = useMemo(() => {
        let iteratedPrecision = 0;
        let iteratedStep = step;
        while (iteratedStep < 1) {
            iteratedStep *= 10;
            iteratedPrecision++;
        }
        return iteratedPrecision;
    }, [step]);

    const [editing, setEditing] = useState(false);
    const [directEditValue, setDirectEditValue] = useState('');
    const directEditInput = useRef<HTMLInputElement>(null);

    const onDirectEdit = useCallback(() => {
        setEditing(true);
        setDirectEditValue(props.value.toString());
    }, [props.value]);

    useEffect(() => {
        if (!editing) return;

        directEditInput.current?.focus();

    }, [editing, directEditInput]);

    const onDirectEditSave = useCallback(() => {
        const rawValue = parseFloat(directEditValue);
        const precisionAdjustedValue = parseFloat(rawValue.toFixed(precision));
        const newValue = clamp(min, max, precisionAdjustedValue);
        onValueChanged(newValue);
        setEditing(false);
    }, [onValueChanged, directEditValue, min, max, precision]);

    const onDirectEditKeyPress = useCallback<React.KeyboardEventHandler<HTMLInputElement>>(e => {
        if (e.key === 'Enter')
            onDirectEditSave();
    }, [onDirectEditSave]);

    return (
        <div className="NumberInput">
            <div className="label">{props.name}</div>
            <div className="interactable">
                <button className="button button-secondary" onClick={onFastDecrement} style={{ marginRight: '1px' }}>
                    <FaAngleDoubleLeft />
                </button>
                <button className="button button-secondary" onClick={onDecrement}>
                    <FaAngleLeft />
                </button>
                {editing ?
                    <input
                        ref={directEditInput}
                        className="value-display"
                        type="text"
                        value={directEditValue}
                        onChange={e => setDirectEditValue(e.target.value)}
                        onKeyPress={onDirectEditKeyPress}
                        onBlur={onDirectEditSave}
                    /> :
                    <div
                        className="value-display"
                        onClick={onDirectEdit}
                    >{props.value.toFixed(precision)}{props.suffix}</div>
                }
                <button className="button button-secondary" onClick={onIncrement}>
                    <FaAngleRight />
                </button>
                <button className="button button-secondary" onClick={onFastIncrement} style={{ marginLeft: '1px' }}>
                    <FaAngleDoubleRight />
                </button>
            </div>
        </div>
    );
};

export interface NumberInputProperties {
    name: string;
    suffix?: string;
    min?: number;
    max?: number;
    step?: number;
    value: number;
    onValueChanged: (newValue: number) => void;
}

export default NumberInput;