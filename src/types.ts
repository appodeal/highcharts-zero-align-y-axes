export type Canon = 0 | 1 | -1;


export interface Constructor<T> extends Function {
    new (...args: Array<any>): T;
}
