// Generated by CodiumAI

import { OrbitMath } from '@app/static/orbit-math';
import * as ootk from 'ootk';
import { Kilometers, Vec3 } from 'ootk';

/**
Main functionalities:
The OrbitMath class provides methods for calculating various orbital parameters from a given state vector. It also includes a method for converting a state vector to TLE (Two-Line Element) format, which is commonly used to describe the orbit of a satellite.

Methods:
- stateVector2Tle: Takes a state vector (position and velocity) and returns a TLE formatted string.
- calculateEccentricity: Calculates the eccentricity of an orbit from the position and velocity vectors.
- calculateInclination: Calculates the inclination of an orbit from the velocity vector.
- calculateMeanAnomaly: Calculates the mean anomaly of an orbit from the position vector.
- calculateMeanMotion: Calculates the mean motion of an orbit from the position and velocity vectors.
- calculateRAAN: Calculates the right ascension of the ascending node of an orbit from the position vector.
- calculateArgumentOfPerigee: Calculates the argument of perigee of an orbit from the position vector.
- cross: Calculates the cross product of two vectors.
- magnitude: Calculates the magnitude of a vector.
- scalar: Multiplies a vector by a scalar.

Fields:
- None.
 */

const sat = {
  TLE1: '1 00000U 00000A   22001.00000000  .00000000  00000-0  00000-0 0  0000',
  TLE2: '2 00000  34.2515   7.2707 1846657   8.0895 354.5630 10.85080249327361',
  position: { x: -1220.0537109375, y: -7397.359375, z: -4922.09423828125 } as Vec3<Kilometers>,
  velocity: { x: 6.511194705963135, y: 0.44591981172561646, z: -0.15588419139385223 } as Vec3<Kilometers>,
};

const sat2 = {
  TLE1: '1 00000U 00000A   22001.00000000  .00000000  00000-0  00000-0 0  0000',
  TLE2: '2 00000  34.2515   7.2707 1846657   8.0895 354.5630 10.85080249327361',
  position: { x: -9254.658203125, y: 2397.3701171875, z: 2223.3359375 },
  velocity: { x: -2.6213555335998535, y: -4.466887474060059, z: -2.8595173358917236 },
};

const satObj = new ootk.Sat(
  {
    tle1: sat.TLE1,
    tle2: sat.TLE2,
  },
  {}
);

const position = [sat.position.x, sat.position.y, sat.position.z];
const velocity = [sat.velocity.x, sat.velocity.y, sat.velocity.z];

const position2 = [sat2.position.x, sat2.position.y, sat2.position.z];
const velocity2 = [sat2.velocity.x, sat2.velocity.y, sat2.velocity.z];

describe('OrbitMath_class', () => {
  // Tests that stateVector2Tle returns the expected TLE1 and TLE2 strings
  it.skip('test_state_vector_to_TLE_conversion', () => {
    const sv = {
      position: sat.position,
      velocity: sat.velocity,
      date: new Date(),
    };
    const tle = OrbitMath.stateVector2Tle(sv);
    expect(tle.TLE1).toMatch(sat.TLE1);
    expect(tle.TLE2).toMatch(sat.TLE2);
  });

  // Tests that calculateEccentricity returns the expected value for a given position and velocity
  it('test_eccentricity_calculation', () => {
    const expectedEccentricity = satObj.eccentricity;
    const eccentricity = OrbitMath.calculateEccentricity(position, velocity);
    expect(eccentricity).toBeCloseTo(expectedEccentricity);
  });

  // Tests that calculateInclination returns the expected value for a given velocity
  it('test_inclination_calculation', () => {
    const expectedInclination = satObj.inclination;
    const inclination = OrbitMath.calculateInclination(position, velocity);
    expect(inclination).toBeCloseTo(expectedInclination, 1);
  });

  // Tests that calculateMeanAnomaly returns the expected value for a given position
  it.skip('test_mean_anomaly_calculation', () => {
    const expectedMeanAnomaly = satObj.meanAnomaly;
    const meanAnomaly = OrbitMath.calculateMeanAnomaly(position, velocity);
    expect(meanAnomaly).toBeCloseTo(expectedMeanAnomaly);
  });

  // Tests that calculateMeanMotion returns the expected value for a given position and velocity
  it('test_mean_motion_calculation', () => {
    const expectedMeanMotion = satObj.meanMotion;
    const meanMotion = OrbitMath.calculateMeanMotion(position, velocity);
    expect(meanMotion).toBeCloseTo(expectedMeanMotion, 1);
  });

  // Tests that calculateRAAN returns the expected value for a given position
  it('test_RAAN_calculation', () => {
    const expectedRAAN = satObj.raan;
    const raan = OrbitMath.calculateRAAN(position, velocity);
    // const raan2 = OrbitMath.calculateRAAN(position2, velocity2);

    // console.warn(raan, raan2, 0.12689765392475172 * RAD2DEG);

    expect(raan).toBeGreaterThan(expectedRAAN - 5);
    expect(raan).toBeLessThan(expectedRAAN + 5);
  });

  // Tests that calculateArgumentOfPerigee returns the expected value for a given position
  it('test_argument_of_perigee_calculation', () => {
    const expectedArgumentOfPerigee = satObj.argOfPerigee;
    const argumentOfPerigee = OrbitMath.calculateArgumentOfPerigee(position, velocity);
    expect(argumentOfPerigee).toBeGreaterThan(expectedArgumentOfPerigee - 3);
    expect(argumentOfPerigee).toBeLessThan(expectedArgumentOfPerigee + 3);
  });
});
