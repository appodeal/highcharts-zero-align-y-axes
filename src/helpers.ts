import {Canon} from './types';


/**
 * Rounds float number to specified precision.
 */
export function fround (value: number, precision = 3) {
    return Number.parseFloat(value.toPrecision(precision));
}


/**
 * Creates an array for specified number range, and fills it with intermediate values according to specified range length.
 */
export function createArrayFromRange (start: number, end: number, length: number = 2, precision = 3): Array<number> {
    if (start === end) {
        return new Array(length).fill(start);
    }
    let range = new Array<number>(length),
        step = (end - start) / (length - 1);
    for (let i = 0, j = fround(start, precision); i < length; i++, j += step) {
        range[i] = fround(j, precision);
    }
    range[length - 1] = fround(end, precision);
    return range;
}


/**
 * Returns true if passed value/values are not equal to undefined and null.
 * Param "mode" decides all values should be defined or it's enough to be defined only one.
 * Can be only "every" or "some". Default mode is "every".
 */
export function isDefined (values: any | Array<any>, mode: 'some' | 'every' = 'every'): boolean {
    return (Array.isArray(values) ? values : [values])[mode](value => {
        return value !== undefined && value !== null;
    });
}


/**
 * Transforms value to canon. Any positive value transforms to 1, negative to -1, zero to 0;
 */
export function numberToCanon (value: number): Canon {
    return Number(!!value) * (value < 0 ? -1 : 1) as Canon;
}
