// Generated by CodiumAI

import { DEG2RAD } from '@app/lib/constants';
import { RadarMath, Watts } from '@app/static/radar-math';
import { Kilometers, Meters, Radians } from 'ootk';

/**
Objective:
The 'minSignal' method of the 'RadarMath' class calculates the minimum detectable signal in dB for a given set of parameters, including the transmitted power, antenna gain, radar cross section, range, and frequency.

Inputs:
- pW: the transmitted power in watts, of type 'Watts'
- aG: the antenna gain, a number
- rcs: the radar cross section in meters squared, of type 'Meters'
- rng: the range, a number
- fMhz: the frequency in MHz, a number

Flow:
1. Convert the frequency from MHz to Hz.
2. Calculate the numerator as the product of the transmitted power, antenna gain squared, radar cross section, and the speed of light squared.
3. Calculate the denominator as the product of the range to the fourth power, a constant, and the frequency squared.
4. Divide the numerator by the denominator to get the minimum signal power.
5. Calculate the minimum signal power in dB using the logarithmic function.
6. Return the minimum signal power in dB.

Outputs:
- minSdB: the minimum detectable signal in dB, a number

Additional aspects:
- The method uses the 'Watts' and 'Meters' types from the 'ootk' library.
- The method is static and belongs to the abstract 'RadarMath' class.
- The method assumes the speed of light to be 3 * 10^8 m/s and the value of pi to be 3.141592653589793.

 */
describe.skip('minSignal_method', () => {
  // Tests that the method returns the correct minimum detectable signal in dB for valid input values.
  it('test_min_signal_with_valid_input', () => {
    expect(RadarMath.minSignal(100000 as Watts, 10, 300 as Meters, 3000 as Meters, 450)).toMatchSnapshot();
  });
});

describe('minSignal_method', () => {
  // Tests that the method returns the correct minimum detectable signal in dB for valid input values.
  it('test_min_signal_valid_input', () => {
    const pW = 100 as Watts;
    const aG = 10;
    const rcs = 5 as Meters;
    const rng = 1000 as Meters;
    const fMhz = 1000;
    const expected = -11.644417078290944;
    const result = RadarMath.minSignal(pW, aG, rcs, rng, fMhz);
    expect(result).toBeCloseTo(expected);
  });
});

describe('beamWidthAtRange_method', () => {
  // Tests that the method returns the correct beam width at a given range.
  it('test_beam_width_at_range', () => {
    const beamWidth = (2.1 * DEG2RAD) as Radians;
    const range = 1000 as Kilometers;
    const expected = 36.643708706556275 as Kilometers;
    const result = RadarMath.beamWidthAtRange(beamWidth, range);
    expect(result).toBeCloseTo(expected);
  });
});
