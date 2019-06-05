import {ZeroTickPositioner} from './zero-tick-positioner';


export function zeroTickPositioner (Highcharts: any) {
    let positioner = new ZeroTickPositioner();
    positioner.register(Highcharts);
    return positioner;
}

