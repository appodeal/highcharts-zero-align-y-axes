# zero-tick-positioner

Forked from https://github.com/chriskmnds/highcharts-zero-align-y-axes.

A plugin for Highcharts that aligns y-axes by zero.

Compatible with Highcharts 7.1.1 and earlier.

## Installation
```
npm install --save zero-tick-positioner
```

## Usage
```javascript
import * as Highcharts from 'highcharts';
import {zeroTickPositioner} from 'zero-tick-positioner';


let positioner = zeroTickPositioner(Highcharts);

positioner.animationEnabled = true; // for enabling animation
positioner.alignZero = false; // for disabling alignment
```
To disable plugin completely:
```javascript
positioner.unregister();
```

## License
MIT
