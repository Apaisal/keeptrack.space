/* eslint-disable class-methods-use-this */
import { MissileParams } from '@app/interfaces';
import { keepTrackApi } from '@app/keepTrackApi';
import { BaseObject, BaseObjectParams, DEG2RAD, Degrees, Kilometers, Radians, SpaceObjectType, Vector3D, calcGmst, eci2lla, lla2eci } from 'ootk';

export class MissileObject extends BaseObject {
  id: number;
  active: boolean;
  type = SpaceObjectType.BALLISTIC_MISSILE;
  desc: string;
  latList: Degrees[];
  lonList: Degrees[];
  altList: Kilometers[];
  timeList: number[];
  startTime: number;
  maxAlt: number;
  country: string;
  launchVehicle: string;
  lastTime: number;

  constructor(info: MissileParams & BaseObjectParams) {
    super(info);
    this.id = info.id;
    this.active = info.active;
    this.desc = info.desc;
    this.latList = info.latList;
    this.lonList = info.lonList;
    this.altList = info.altList;
    this.timeList = info.timeList;
    this.startTime = info.startTime;
    this.maxAlt = info.maxAlt;
    this.country = info.country;
    this.launchVehicle = info.launchVehicle;
  }

  isStatic(): boolean {
    return false;
  }

  isMissile(): boolean {
    return true;
  }

  getAltitude(): Kilometers {
    const { gmst } = calcGmst(keepTrackApi.getTimeManager().simulationTimeObj);
    const lla = eci2lla(this.position, gmst);
    return lla.alt;
  }

  getTimeInTrajectory(): number {
    this.lastTime ??= 0;

    for (let t = this.lastTime; t < this.altList.length; t++) {
      if (this.startTime * 1 + t * 1000 >= keepTrackApi.getTimeManager().simulationTimeObj.getTime()) {
        this.lastTime = t;
        break;
      }
    }

    return this.lastTime;
  }

  eci(t = this.getTimeInTrajectory()): Vector3D {
    const { gmst } = calcGmst(keepTrackApi.getTimeManager().simulationTimeObj);
    const lat = this.latList[t];
    const lon = this.lonList[t];
    const alt = this.altList[t];
    const lla = {
      lat: (lat * DEG2RAD) as Radians,
      lon: (lon * DEG2RAD) as Radians,
      alt,
    };

    const eci = lla2eci(lla, gmst);
    return new Vector3D(eci.x, eci.y, eci.z);
  }

  isGoingUp(): boolean {
    const t = this.getTimeInTrajectory();
    if (this.altList[t] > this.altList[t - 1]) {
      return true;
    } else {
      return false;
    }
  }
}
