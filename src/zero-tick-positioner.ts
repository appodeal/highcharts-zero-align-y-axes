import {Axis, AxisTickPositionerCallbackFunction, Chart} from 'highcharts';
import {createArrayFromRange, isDefined, numberToCanon} from './helpers';
import {Canon, Constructor} from './types';


export class ZeroTickPositioner {
    alignZero: boolean;
    animationEnabled = false;
    private minMaxStorage = new WeakMap<Chart, {
        limits: Map<number, { min: number, max: number }>,
        canon: Map<number, { min: Canon, max: Canon }>
    }>();
    private unregisterCallback: Function;

    private chartCallback = (chart: Chart) => {
        let yAxes = chart.axes.filter(axis => axis.coll === 'yAxis'),
            multiple = yAxes.length > 1;
        this.alignZero = true;
        for (let axis of yAxes) {
            if (axis.coll === 'yAxis') {
                axis.update({
                    tickPositioner: this.createPositioner(multiple)
                }, false);
            }
        }
        chart.redraw(this.animationEnabled);
    };

    private static getAxisIndex (axis: Axis): number {
        return axis['options'].index;
    }

    private static createMinMaxCanon (limits: Map<number, { min: number, max: number }>): Map<number, { min: Canon, max: Canon }> {
        let canon = new Map<number, { min: 0 | -1 | 1, max: 0 | -1 | 1 }>();
        for (let [index, {min, max}] of limits.entries()) {
            canon.set(index, {
                min: numberToCanon(min),
                max: numberToCanon(max)
            });
        }
        return canon;
    }

    register (Highcharts: { Chart: Constructor<Chart> }) {
        if (!Highcharts.Chart.prototype.callbacks.includes(this.chartCallback)) {
            Highcharts.Chart.prototype.callbacks.push(this.chartCallback);
            this.unregister = () => {
                let index = Highcharts.Chart.prototype.callbacks.indexOf(this.chartCallback);
                if (index !== -1) {
                    Highcharts.Chart.prototype.callbacks.splice(index, 1);
                }
            };
        }
    }

    unregister () {
        if (typeof this.unregisterCallback === 'function') {
            this.unregisterCallback();
        }
    }

    private createPositioner (multiple: boolean = false): AxisTickPositionerCallbackFunction {
        const _this = this;
        return function (this: Axis): Array<number> {
            let {min, max, chart} = this,
                tickCount = this['tickAmount'] || 6;
            if (!isDefined([min, max])) {
                return;
            }

            if (!multiple || !_this.alignZero) {
                return createArrayFromRange(min, max, tickCount);
            } else {
                let hasLimits = _this.collectMinMaxData(chart);
                if (!hasLimits) {
                    _this.minMaxStorage.delete(chart);
                    return createArrayFromRange(min, max, tickCount);
                }

                let {limits, canon} = _this.minMaxStorage.get(chart),
                    {min: _min, max: _max} = limits.get(ZeroTickPositioner.getAxisIndex(this)),
                    {min: firstMin, max: firstMax} = limits.get(0),
                    {min: secondMin, max: secondMax} = limits.get(1),
                    {min: firstMinCanon, max: firstMaxCanon} = canon.get(0),
                    {min: secondMinCanon, max: secondMaxCanon} = canon.get(1);

                if (firstMinCanon <= 0 && firstMaxCanon <= 0 && secondMinCanon <= 0 && secondMaxCanon <= 0) {
                    _max = 0;
                } else if (firstMinCanon >= 0 && firstMaxCanon >= 0 && secondMinCanon >= 0 && secondMaxCanon >= 0) {
                    _min = 0;
                } else if (firstMaxCanon === secondMaxCanon) {
                    let dividend = firstMin <= secondMin ? firstMin : secondMin,
                        divisor = firstMin <= secondMin ? firstMax : secondMax;
                    _min = dividend / divisor * _max;
                } else if (firstMinCanon === secondMinCanon) {
                    let dividend = firstMax > secondMax ? firstMax : secondMax,
                        divisor = firstMax > secondMax ? firstMin : secondMin;
                    _max = dividend / divisor * _min;
                } else {
                    if (_min < 0) {
                        _max = Math.abs(_min);
                    } else {
                        _min = _max * -1;
                    }
                }
                return createArrayFromRange(_min, _max, tickCount);
            }

        };
    }

    /**
     * Returns true if all "Y" axes has min and max values, otherwise returns false
     */
    private collectMinMaxData (chart: Chart): boolean {
        let data = this.minMaxStorage.get(chart);
        if (!data) {
            data = {
                limits: new Map(),
                canon: new Map()
            };
        }
        let {limits, canon} = data;
        if (limits.size < 2) {
            for (let [index, axis] of chart.axes.filter(axis => axis.coll === 'yAxis').entries()) {
                if (!isDefined([axis.max, axis.min])) {
                    return false;
                }
                limits.set(index, {
                    min: axis.min,
                    max: axis.max
                });
            }
            canon = ZeroTickPositioner.createMinMaxCanon(limits);
        }
        this.minMaxStorage.set(chart, {limits, canon});
        return limits.size >= 2 && canon.size >= 2;
    }


}



