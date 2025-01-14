import { SatPassTimes } from '@app/interfaces';
import { SatInfoBox } from '@app/plugins/select-sat-manager/sat-info-box';
import { errorManagerInstance } from '@app/singletons/errorManager';
import {
  BaseObject,
  DEG2RAD,
  Degrees,
  DetailedSatellite,
  DetailedSensor,
  EciVec3,
  Kilometers,
  MINUTES_PER_DAY,
  RfSensor,
  SatelliteRecord,
  Sgp4,
  SpaceObjectType,
  TAU,
  ecfRad2rae,
  eci2ecf,
  eci2lla,
} from 'ootk';
import { keepTrackApi } from '../keepTrackApi';
import { dateFormat } from '../lib/dateFormat';
import { SatMath } from './sat-math';

export type TearrData = {
  objName: string;
  rng: Kilometers;
  az: Degrees;
  el: Degrees;
  time: string;
  inView?: boolean;
  alt?: Kilometers;
  lat?: Degrees;
  lon?: Degrees;
};

export class SensorMath {
  /**
   * @deprecated - Use ootk instead
   */
  static getTearData(now: Date, satrec: SatelliteRecord, sensors: DetailedSensor[], isRiseSetLookangles = false): TearrData {
    // TODO: Instead of doing the first sensor this should return an array of TEARRs for all sensors.
    const sensor = sensors[0];

    let aer = SatMath.getRae(now, satrec, sensor);
    const isInFOV = SatMath.checkIsInView(sensor, aer);

    if (isInFOV) {
      if (isRiseSetLookangles) {
        // Previous Pass to Calculate first line of coverage
        const now1 = new Date();
        now1.setTime(Number(now) - 1000);
        let aer1 = SatMath.getRae(now1, satrec, sensor);
        let isInFOV1 = SatMath.checkIsInView(sensor, aer1);

        // Is in FOV and Wasn't Last Time so First Line of Coverage
        if (!isInFOV1) {
          return {
            time: dateFormat(now, 'isoDateTime', true),
            rng: aer.rng,
            az: aer.az,
            el: aer.el,
            inView: isInFOV,
            objName: sensor.objName,
          };
        } else {
          // Next Pass to Calculate Last line of coverage
          now1.setTime(Number(now) + 1000);
          aer1 = SatMath.getRae(now1, satrec, sensor);
          isInFOV1 = SatMath.checkIsInView(sensor, aer1);

          // Is in FOV and Wont Be Next Time so Last Line of Coverage
          if (!isInFOV1) {
            return {
              time: dateFormat(now, 'isoDateTime', true),
              rng: aer.rng,
              az: aer.az,
              el: aer.el,
              inView: isInFOV,
              objName: sensor.objName,
            };
          }
        }
        return {
          time: '',
          rng: <Kilometers>null,
          az: <Degrees>null,
          el: <Degrees>null,
          inView: isInFOV,
          objName: sensor.objName,
        };
      }
      return {
        time: dateFormat(now, 'isoDateTime', true),
        rng: aer.rng,
        az: aer.az,
        el: aer.el,
        inView: isInFOV,
        objName: sensor.objName,
      };
    }
    return {
      time: '',
      rng: aer.rng,
      az: aer.az,
      el: aer.el,
      inView: isInFOV,
      objName: sensor.objName,
    };
  }

  /**
   * @deprecated - Use ootk instead
   */
  static getTearr(sat: DetailedSatellite, sensors: DetailedSensor[], propTime?: Date): TearrData {
    const timeManagerInstance = keepTrackApi.getTimeManager();

    const tearr = <TearrData>{}; // Most current TEARR data that is set in satellite object and returned.

    const sensorManagerInstance = keepTrackApi.getSensorManager();
    sensors = sensorManagerInstance.verifySensors(sensors);
    // TODO: Instead of doing the first sensor this should return an array of TEARRs for all sensors.
    const sensor = sensors[0];

    // Set default timing settings. These will be changed to find look angles at different times in future.
    const now = typeof propTime !== 'undefined' ? propTime : timeManagerInstance.simulationTimeObj;
    const { m, gmst } = SatMath.calculateTimeVariables(now, sat.satrec);
    let positionEci = <EciVec3>Sgp4.propagate(sat.satrec, m).position;
    if (!positionEci) {
      errorManagerInstance.debug(`No ECI position for ${sat.satrec.satnum} at ${now}`);
      tearr.alt = <Kilometers>0;
      tearr.lon = <Degrees>0;
      tearr.lat = <Degrees>0;
      tearr.az = <Degrees>0;
      tearr.el = <Degrees>0;
      tearr.rng = <Kilometers>0;
    }

    try {
      let gpos = eci2lla(positionEci, gmst);
      tearr.alt = gpos.alt;
      tearr.lon = gpos.lon;
      tearr.lat = gpos.lat;
      let positionEcf = eci2ecf(positionEci, gmst);
      let lookAngles = ecfRad2rae(sensor.llaRad(), positionEcf);
      tearr.az = lookAngles.az;
      tearr.el = lookAngles.el;
      tearr.rng = lookAngles.rng;
    } catch /* istanbul ignore next */ {
      tearr.alt = <Kilometers>0;
      tearr.lon = <Degrees>0;
      tearr.lat = <Degrees>0;
      tearr.az = <Degrees>0;
      tearr.el = <Degrees>0;
      tearr.rng = <Kilometers>0;
    }

    tearr.inView = SatMath.checkIsInView(sensor, {
      az: tearr.az,
      el: tearr.el,
      rng: tearr.rng,
    });
    return tearr;
  }

  static distanceString(hoverSat: BaseObject, secondaryObj?: DetailedSensor | DetailedSatellite): string {
    // Sanity Check
    if (hoverSat == null || secondaryObj == null) return '';

    // Get Objects
    // const catalogManagerInstance = keepTrackApi.getCatalogManager();
    // hoverSat = catalogManagerInstance.getObject(hoverSat.id);
    // selectedSat = catalogManagerInstance.getObject(selectedSat.id);

    // Validate Objects
    if (secondaryObj == null || hoverSat == null) return '';
    if (secondaryObj.type === SpaceObjectType.STAR || hoverSat.type === SpaceObjectType.STAR) return '';

    // Calculate Distance
    const distanceApart = SatMath.distance(hoverSat.position, secondaryObj.position).toFixed(0);

    // Calculate if same beam
    let sameBeamStr = '';
    try {
      const satInfoBoxCorePlugin = keepTrackApi.getPlugin(SatInfoBox);
      if (satInfoBoxCorePlugin.currentTEARR?.inView) {
        const sensorManagerInstance = keepTrackApi.getSensorManager();

        const firstSensor = sensorManagerInstance.currentSensors[0];
        if (firstSensor instanceof RfSensor && parseFloat(distanceApart) < satInfoBoxCorePlugin.currentTEARR?.rng * Math.sin(DEG2RAD * firstSensor.beamwidth)) {
          if (satInfoBoxCorePlugin.currentTEARR?.rng < sensorManagerInstance.currentSensors[0].maxRng && satInfoBoxCorePlugin.currentTEARR?.rng > 0) {
            sameBeamStr = ' (Within One Beam)';
          }
        }
      }
    } catch {
      // Intentionally Blank
    }

    return '<br />Range: ' + distanceApart + ' km' + sameBeamStr;
  }

  static getSunTimes(sat: DetailedSatellite, sensors?: DetailedSensor[], searchLength = 2, interval = 30) {
    const timeManagerInstance = keepTrackApi.getTimeManager();
    const sensorManagerInstance = keepTrackApi.getSensorManager();

    sensors = sensorManagerInstance.verifySensors(sensors);
    // TOOD: Instead of doing the first sensor this should return an array of TEARRs for all sensors.
    const sensor = sensors[0];

    let minDistanceApart = 100000000000; // Arbitrarily large number

    // var minDistTime;
    let offset = 0;
    for (let i = 0; i < searchLength * 24 * 60 * 60; i += interval) {
      // 5second Looks
      offset = i * 1000; // Offset in seconds (msec * 1000)
      const now = timeManagerInstance.getOffsetTimeObj(offset);
      const { m, j, gmst } = SatMath.calculateTimeVariables(now, sat.satrec);

      const [sunX, sunY, sunZ] = SatMath.getSunDirection(j);
      const eci = <EciVec3>Sgp4.propagate(sat.satrec, m).position;
      if (!eci) {
        console.debug('No ECI position for', sat.name, 'at', now);
        continue;
      }

      const distX = Math.pow(sunX - eci.x, 2);
      const distY = Math.pow(sunY - eci.y, 2);
      const distZ = Math.pow(sunZ - eci.z, 2);
      const dist = Math.sqrt(distX + distY + distZ);

      const positionEcf = eci2ecf(eci, gmst);
      const lookAngles = ecfRad2rae(sensor.llaRad(), positionEcf);
      const { az, el, rng } = lookAngles;

      if (sensor.minAz > sensor.maxAz) {
        if (
          ((az >= sensor.minAz || az <= sensor.maxAz) && el >= sensor.minEl && el <= sensor.maxEl && rng <= sensor.maxRng && rng >= sensor.minRng) ||
          ((az >= sensor.minAz2 || az <= sensor.maxAz2) && el >= sensor.minEl2 && el <= sensor.maxEl2 && rng <= sensor.maxRng2 && rng >= sensor.minRng2)
        ) {
          if (dist < minDistanceApart) {
            minDistanceApart = dist;
          }
        }
      } else {
        if (
          (az >= sensor.minAz && az <= sensor.maxAz && el >= sensor.minEl && el <= sensor.maxEl && rng <= sensor.maxRng && rng >= sensor.minRng) ||
          (az >= sensor.minAz2 && az <= sensor.maxAz2 && el >= sensor.minEl2 && el <= sensor.maxEl2 && rng <= sensor.maxRng2 && rng >= sensor.minRng2)
        ) {
          if (dist < minDistanceApart) {
            minDistanceApart = dist;
          }
        }
      }
    }
  }

  static nextNpasses(sat: DetailedSatellite, sensors: DetailedSensor[], searchLength: number, interval: number, numPasses: number): Date[] {
    const timeManagerInstance = keepTrackApi.getTimeManager();
    const sensorManagerInstance = keepTrackApi.getSensorManager();

    sensors = sensorManagerInstance.verifySensors(sensors);
    // TODO: Instead of doing the first sensor this should return an array of TEARRs for all sensors.
    const sensor = sensors[0];

    // If length and interval not set try to use defaults
    searchLength = searchLength || 2;
    interval = interval || 30;
    numPasses = numPasses || 1;

    let passTimesArray = [];
    let offset = 0;

    const orbitalPeriod = MINUTES_PER_DAY / ((sat.satrec.no * MINUTES_PER_DAY) / TAU); // Seconds in a day divided by mean motion
    for (let i = 0; i < searchLength * 24 * 60 * 60; i += interval) {
      // 5second Looks
      // Only pass a maximum of N passes
      if (passTimesArray.length >= numPasses) {
        return passTimesArray;
      }

      offset = i * 1000; // Offset in seconds (msec * 1000)
      let now = timeManagerInstance.getOffsetTimeObj(offset);
      let aer = SatMath.getRae(now, sat.satrec, sensor, true);

      let isInFOV = SatMath.checkIsInView(sensor, aer);
      if (isInFOV) {
        passTimesArray.push(now);
        // Jump 3/4th to the next orbit
        i = i + orbitalPeriod * 60 * 0.75; // NOSONAR
      }
    }
    return passTimesArray;
  }

  static nextpass(sat: DetailedSatellite, sensors?: DetailedSensor[], searchLength?: number, interval?: number) {
    const timeManagerInstance = keepTrackApi.getTimeManager();
    const sensorManagerInstance = keepTrackApi.getSensorManager();

    sensors = sensorManagerInstance.verifySensors(sensors);
    // Loop through sensors looking for in view times
    const inViewTime = [];
    // If length and interval not set try to use defaults
    searchLength ??= 2;
    interval ??= 30;

    for (const sensor of sensors) {
      let offset = 0;
      for (let i = 0; i < searchLength * 24 * 60 * 60; i += interval) {
        // 5second Looks
        offset = i * 1000; // Offset in seconds (msec * 1000)
        const now = timeManagerInstance.getOffsetTimeObj(offset);
        const aer = SatMath.getRae(now, sat.satrec, sensor, true);

        const isInFOV = SatMath.checkIsInView(sensor, aer);
        if (isInFOV) {
          inViewTime.push(now);
          break;
        }
      }
    }
    // If there are in view times find the earlierst and return it formatted
    if (inViewTime.length > 0) {
      inViewTime.sort((a, b) => a.getTime() - b.getTime());
      return dateFormat(inViewTime[0], 'isoDateTime', true);
    } else {
      return 'No Passes in ' + searchLength + ' Days';
    }
  }

  static nextpassList(satArray: DetailedSatellite[], sensorArray: DetailedSensor[], interval?: number, days = 7): SatPassTimes[] {
    let nextPassArray: SatPassTimes[] = [];
    const nextNPassesCount = settingsManager ? settingsManager.nextNPassesCount : 1;
    for (const sat of satArray) {
      const passes = SensorMath.nextNpasses(sat, sensorArray, days, interval || 30, nextNPassesCount); // Only do 1 day looks
      for (const pass of passes) {
        nextPassArray.push({
          sat: sat,
          time: pass,
        });
      }
    }
    return nextPassArray;
  }
}
