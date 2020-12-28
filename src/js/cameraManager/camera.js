/**
// /////////////////////////////////////////////////////////////////////////////

Copyright (C) 2016-2020 Theodore Kruczek
Copyright (C) 2020 Heather Kruczek

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

// /////////////////////////////////////////////////////////////////////////////

@format
*/

/**
 * @todo cameraManager.js Testing Full Coverage
 * @body Complete 100% testing coverage and input validation for @app/test/cameraManager.test.js. Use cameraManager.setZoomLevel() as an example of a correct test/validation.
 */

import * as glm from '@app/js/lib/gl-matrix.js';
import { DEG2RAD, RADIUS_OF_EARTH, TAU, ZOOM_EXP } from '@app/js/constants.js';
let settingsManager = window.settingsManager;

class Camera {
  constructor() {
    this.camMatrix = glm.mat4.create();
    this.camMatrixEmpty = glm.mat4.create();
    this.normUp = [0, 0, 0];
    this.normLeft = [0, 0, 0];
    this.normForward = [0, 0, 0];
    this.isZoomIn = false;
    this.isRotateEarth = true;
    this.mouseX = 0;
    this.mouseY = 0;
    this.screenDragPoint = [0, 0];
    this.camYaw = 0;
    this.camPitch = 0;
    this.zoomLevel = 0.6925;
    this.zoomTarget = 0.6925;
    this.isCtrlPressed = false;
    this.isShiftPressed = false;
    this.yawErr = 0;
    this.camYawTarget = 0;
    this.camPitchTarget = 0;
    this.fpsPitch = 0;
    this.fpsPitchRate = 0;
    this.fpsRotate = 0;
    this.fpsRotateRate = 0;
    this.fpsYaw = 0;
    this.fpsYawRate = 0;
    this.fpsXPos = 0;
    this.fpsYPos = 0;
    this.fpsZPos = 0;
    this.fpsForwardSpeed = 0;
    this.fpsSideSpeed = 0;
    this.fpsVertSpeed = 0;
    this.isFPSForwardSpeedLock = false;
    this.isFPSSideSpeedLock = false;
    this.isFPSVertSpeedLock = false;
    this.fpsRun = 1;
    this.fpsLastTime = 1;
    this.cSTS = {};
    this.camZoomSnappedOnSat = false;
    this.camAngleSnappedOnSat = false;
    this.isRayCastingEarth = false;
    this.dragStartPitch = 0;
    this.dragStartYaw = 0;
    this.isDragging = false;
    this.chaseSpeed = 0.0035;
    this.speedModifier = 1;
    this.isPanning = false;
    this.isWorldPan = false;
    this.isScreenPan = false;
    this.panReset = false;
    this.panSpeed = { x: 0, y: 0, z: 0 };
    this.panMovementSpeed = 0.5;
    this.panTarget = { x: 0, y: 0, z: 0 };
    this.panCurrent = { x: 0, y: 0, z: 0 };
    this.panDif = { x: 0, y: 0, z: 0 };
    this.panStartPosition = { x: 0, y: 0, z: 0 };
    this.camPitchSpeed = 0;
    this.camYawSpeed = 0;
    this.camSnapMode = false;
    this.isLocalRotate = false;
    this.localRotateReset = false;
    this.localRotateSpeed = { pitch: 0, roll: 0, yaw: 0 };
    this.localRotateMovementSpeed = 0.00005;
    this.localRotateTarget = { pitch: 0, roll: 0, yaw: 0 };
    this.localRotateCurrent = { pitch: 0, roll: 0, yaw: 0 };
    this.localRotateDif = { pitch: 0, roll: 0, yaw: 0 };
    this.localRotateStartPosition = { pitch: 0, roll: 0, yaw: 0 };
    this.ecPitch = 0;
    this.ecYaw = 0;
    this.ftsPitch = 0;
    this.ftsYaw = 0;
    this.ftsRotateReset = false;
    this.ecLastZoom = 0.45;
    this.camRotateSpeed = 0;
    this.cameraType = {
      current: 0,
      default: 0,
      fixedToSat: 1,
      offset: 2,
      fps: 3,
      planetarium: 4,
      satellite: 5,
      astronomy: 6,
      set: (val) => {
        if (typeof val !== 'number') throw new TypeError();
        if (val > 6 || val < 0) throw new RangeError();

        this.cameraType.current = val;
        this.resetFpsPos();
      },
    };
  }

  set camPitch(val) {
    this._camPitch = val;
  }

  get camPitch() {
    return this._camPitch;
  }

  set camYaw(val) {
    this._camYaw = val;
  }

  get camYaw() {
    return this._camYaw;
  }

  set isZoomIn(val) {
    if (typeof val !== 'boolean') throw new TypeError();
    this._isZoomIn = val;
  }

  get isZoomIn() {
    return this._isZoomIn;
  }

  set mouseX(val) {
    if (typeof val !== 'number') throw new TypeError();
    this._mouseX = val;
  }

  get mouseX() {
    return this._mouseX;
  }

  set mouseY(val) {
    if (typeof val !== 'number') throw new TypeError();
    this._mouseY = val;
  }

  get mouseY() {
    return this._mouseY;
  }

  set screenDragPoint(val) {
    if (typeof val !== 'object' || val.length !== 2) throw new TypeError();
    this._screenDragPoint = val;
  }

  get screenDragPoint() {
    return this._screenDragPoint;
  }

  set zoomLevel(val) {
    if (typeof val !== 'number') throw new TypeError();
    if (val > 1.0) {
      val = 1.0;
    }
    if (val < 0.0) {
      val = 0;
    }
    this._zoomLevel = val;
  }

  get zoomLevel() {
    return this._zoomLevel;
  }

  set zoomTarget(zoom) {
    this._zoomTarget = zoom;
  }

  get zoomTarget() {
    return this._zoomTarget;
  }

  set isCtrlPressed(val) {
    if (typeof val !== 'boolean') throw new TypeError();
    this._isCtrlPressed = val;
  }

  get isCtrlPressed() {
    return this._isCtrlPressed;
  }

  set isShiftPressed(val) {
    if (typeof val !== 'boolean') throw new TypeError();
    this._isShiftPressed = val;
  }

  get isShiftPressed() {
    return this._isShiftPressed;
  }

  set isPanning(val) {
    this._isPanning = val;
  }

  get isPanning() {
    return this._isPanning;
  }

  set dragStartPitch(val) {
    this._dragStartPitch = val;
  }

  get dragStartPitch() {
    return this._dragStartPitch;
  }

  set dragStartYaw(val) {
    this._dragStartYaw = val;
  }

  get dragStartYaw() {
    return this._dragStartYaw;
  }

  set isDragging(val) {
    this._isDragging = val;
  }

  get isDragging() {
    return this._isDragging;
  }

  set speedModifier(val) {
    this._speedModifier = val;
  }

  get speedModifier() {
    return this._speedModifier;
  }

  // Panning Settings/Flags
  set panReset(val) {
    this._panReset = val;
  }

  get panReset() {
    return this._panReset;
  }

  set camSnapMode(val) {
    this._camSnapMode = val;
  }

  get camSnapMode() {
    return this._camSnapMode;
  }

  set isLocalRotate(val) {
    this._isLocalRotate = val;
  }

  get isLocalRotate() {
    return this._isLocalRotate;
  }

  set localRotateReset(val) {
    this._localRotateReset = val;
  }

  get localRotateReset() {
    return this._localRotateReset;
  }

  set localRotateStartPosition(pos) {
    this._localRotateStartPosition = pos;
  }

  get localRotateStartPosition() {
    return this._localRotateStartPosition;
  }

  set isLocalRotateRoll(val) {
    this._isLocalRotateRoll = val;
  }

  get isLocalRotateRoll() {
    return this._isLocalRotateRoll;
  }

  set isLocalRotateYaw(val) {
    this._isLocalRotateYaw = val;
  }

  get isLocalRotateYaw() {
    return this._isLocalRotateYaw;
  }

  set ecLastZoom(val) {
    this._ecLastZoom = val;
  }

  get ecLastZoom() {
    return this._ecLastZoom;
  }

  set camZoomSnappedOnSat(val) {
    this._camZoomSnappedOnSat = val;
  }

  get camZoomSnappedOnSat() {
    return this._camZoomSnappedOnSat;
  }

  set camAngleSnappedOnSat(val) {
    this._camAngleSnappedOnSat = val;
  }

  get camAngleSnappedOnSat() {
    return this._camAngleSnappedOnSat;
  }

  set ftsRotateReset(val) {
    this._ftsRotateReset = val;
  }

  get ftsRotateReset() {
    return this._ftsRotateReset;
  }

  // Related to the currently disabled raycast
  earthHitTest(gl, pickColorBuf, x, y) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
    gl.readPixels(x, gl.drawingBufferHeight - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pickColorBuf);
    this.isRayCastingEarth = pickColorBuf[0] === 0 && pickColorBuf[1] === 0 && pickColorBuf[2] === 0;
  }

  rotateEarth(val) {
    if (typeof val == 'undefined') {
      this.isRotateEarth = !this.isRotateEarth;
      return;
    }
    if (typeof val !== 'boolean') throw new TypeError();
    this.isRotateEarth = val;
  }

  changeZoom(zoom) {
    if (zoom === 'geo') {
      this.zoomTarget = 0.82;
      return;
    }
    if (zoom === 'leo') {
      this.zoomTarget = 0.45;
      return;
    }
    this.zoomTarget = zoom;
  }

  resetFpsPos() {
    this.fpsPitch = 0;
    this.fpsYaw = 0;
    this.fpsXPos = 0;

    // Move out from the center of the Earth in FPS Mode
    if (this.cameraType.current == 3) {
      this.fpsYPos = 25000;
    } else {
      this.fpsYPos = 0;
    }
    this.fpsZPos = 0;
  }

  getCamPos() {
    let gCPr = this._getCamDist();
    let gCPz = gCPr * Math.sin(this.camPitch);
    let gCPrYaw = gCPr * Math.cos(this.camPitch);
    let gCPx = gCPrYaw * Math.sin(this.camYaw);
    let gCPy = gCPrYaw * -Math.cos(this.camYaw);
    return [gCPx, gCPy, gCPz];
  }

  static normalizeAngle(angle) {
    angle %= TAU;
    if (angle > TAU / 2) angle -= TAU;
    if (angle < -TAU / 2) angle += TAU;
    return angle;
  }

  lookAtSensor(zoom, lat, long, date) {
    this.changeZoom(zoom);
    this.camSnap(Camera.latToPitch(lat), Camera.longToYaw(long, date));
  }

  static longToYaw(long, selectedDate) {
    let today = new Date();
    let angle = 0;

    // NOTE: This formula sometimes is incorrect, but has been stable for over a year
    // NOTE: Looks wrong again as of 8/29/2020 - time of year issue?
    today.setUTCHours(selectedDate.getUTCHours() + selectedDate.getUTCMonth() * 2 - 11); // Offset has to account for time of year. Add 2 Hours per month into the year starting at -12.

    today.setUTCMinutes(selectedDate.getUTCMinutes());
    today.setUTCSeconds(selectedDate.getUTCSeconds());
    selectedDate.setUTCHours(0);
    selectedDate.setUTCMinutes(0);
    selectedDate.setUTCSeconds(0);
    let longOffset = (today - selectedDate) / 60 / 60 / 1000; // In Hours
    if (longOffset > 24) longOffset = longOffset - 24;
    longOffset = longOffset * 15; // 15 Degress Per Hour longitude Offset

    angle = (long + longOffset) * DEG2RAD;
    angle = Camera.normalizeAngle(angle);
    return angle;
  }

  static latToPitch(lat) {
    let pitch = lat * DEG2RAD;
    if (pitch > TAU / 4) pitch = TAU / 4; // Max 90 Degrees
    if (pitch < -TAU / 4) pitch = -TAU / 4; // Min -90 Degrees
    return pitch;
  }

  camSnap(pitch, yaw) {
    // this.panReset = true
    this.camPitchTarget = pitch;
    this.camYawTarget = Camera.normalizeAngle(yaw);
    this.ecPitch = pitch;
    this.ecYaw = yaw;
    this.camSnapMode = true;
  }

  camSnapToSat(sat) {
    /* this function runs every frame that a satellite is selected.
    However, the user might have broken out of the zoom snap or angle snap.
    If so, don't change those targets. */

    if (this.camAngleSnappedOnSat) {
      this.cSTS.pos = sat.position;
      this.cSTS.r = Math.sqrt(this.cSTS.pos.x ** 2 + this.cSTS.pos.y ** 2);
      this.cSTS.yaw = Math.atan2(this.cSTS.pos.y, this.cSTS.pos.x) + TAU / 4;
      this.cSTS.pitch = Math.atan2(this.cSTS.pos.z, this.cSTS.r);
      if (!this.cSTS.pitch) {
        console.warn('Pitch Calculation Error');
        this.cSTS.pitch = 0;
        this.camZoomSnappedOnSat = false;
        this.camAngleSnappedOnSat = false;
      }
      if (!this.cSTS.yaw) {
        console.warn('Yaw Calculation Error');
        this.cSTS.yaw = 0;
        this.camZoomSnappedOnSat = false;
        this.camAngleSnappedOnSat = false;
      }
      if (this.cameraType.current === this.cameraType.planetarium) {
        // camSnap(-pitch, -yaw)
      } else {
        this.camSnap(this.cSTS.pitch, this.cSTS.yaw);
      }
    }

    if (this.camZoomSnappedOnSat) {
      // cSTS.altitude;
      // cSTS.camDistTarget;
      if (!sat.missile && !sat.static && sat.active) {
        // if this is a satellite not a missile
        this.cSTS.altitude = sat.getAltitude();
      }
      if (sat.missile) {
        this.cSTS.altitude = sat.maxAlt + 1000; // if it is a missile use its altitude
      }
      if (this.cSTS.altitude) {
        this.cSTS.camDistTarget = this.cSTS.altitude + RADIUS_OF_EARTH + settingsManager.camDistBuffer;
      } else {
        this.cSTS.camDistTarget = RADIUS_OF_EARTH + settingsManager.camDistBuffer; // Stay out of the center of the earth. You will get stuck there.
        console.warn(`Zoom Calculation Error: ${this.cSTS.altitude} -- ${this.cSTS.camDistTarget}`);
        this.camZoomSnappedOnSat = false;
        this.camAngleSnappedOnSat = false;
      }

      this.cSTS.camDistTarget = this.cSTS.camDistTarget < settingsManager.minZoomDistance ? settingsManager.minZoomDistance + 10 : this.cSTS.camDistTarget;

      this.zoomTarget = Math.pow((this.cSTS.camDistTarget - settingsManager.minZoomDistance) / (settingsManager.maxZoomDistance - settingsManager.minZoomDistance), 1 / ZOOM_EXP);
      this.ecLastZoom = this.zoomTarget + 0.1;

      // Only Zoom in Once on Mobile
      if (settingsManager.isMobileModeEnabled) this.camZoomSnappedOnSat = false;
    }

    if (this.cameraType.current === this.cameraType.planetarium) {
      this.zoomTarget = 0.01;
    }
  }

  fts2default() {
    this.cameraType.current = this.cameraType.current == this.cameraType.fixedToSat ? this.cameraType.default : this.cameraType.current;
    if (this.cameraType.current == this.cameraType.default || this.cameraType.current == this.cameraType.offset) {
      this.camPitch = this.ecPitch;
      this.camYaw = this.ecYaw;
      this.zoomTarget = this.ecLastZoom; // Reset Zoom
    }
  }

  keyUpHandler(evt) {
    // Error Handling
    if (typeof evt.key == 'undefined') return;

    if (evt.key.toUpperCase() === 'A' && this.fpsSideSpeed === -settingsManager.fpsSideSpeed) {
      this.isFPSSideSpeedLock = false;
    }
    if (evt.key.toUpperCase() === 'D' && this.fpsSideSpeed === settingsManager.fpsSideSpeed) {
      this.isFPSSideSpeedLock = false;
    }
    if (evt.key.toUpperCase() === 'S' && this.fpsForwardSpeed === -settingsManager.fpsForwardSpeed) {
      this.isFPSForwardSpeedLock = false;
    }
    if (evt.key.toUpperCase() === 'W' && this.fpsForwardSpeed === settingsManager.fpsForwardSpeed) {
      this.isFPSForwardSpeedLock = false;
    }
    if (evt.key.toUpperCase() === 'Q') {
      if (this.fpsVertSpeed === -settingsManager.fpsVertSpeed) this.isFPSVertSpeedLock = false;
      this.fpsRotateRate = 0;
    }
    if (evt.key.toUpperCase() === 'E') {
      if (this.fpsVertSpeed === settingsManager.fpsVertSpeed) this.isFPSVertSpeedLock = false;
      this.fpsRotateRate = 0;
    }
    if (evt.key.toUpperCase() === 'J' || evt.key.toUpperCase() === 'L') {
      if (this.cameraType.current === this.cameraType.astronomy) {
        this.fpsRotateRate = 0;
      } else {
        this.fpsYawRate = 0;
      }
    }
    if (evt.key.toUpperCase() === 'I' || evt.key.toUpperCase() === 'K') {
      this.fpsPitchRate = 0;
    }

    if (evt.key.toUpperCase() === 'SHIFT') {
      this.isShiftPressed = false;
      this.fpsRun = 1;
      settingsManager.cameraMovementSpeed = 0.003;
      settingsManager.cameraMovementSpeedMin = 0.005;
      this.speedModifier = 1;
      if (!this.isFPSForwardSpeedLock) this.fpsForwardSpeed = 0;
      if (!this.isFPSSideSpeedLock) this.fpsSideSpeed = 0;
      if (!this.isFPSVertSpeedLock) this.fpsVertSpeed = 0;
    }
    // Applies to _keyDownHandler as well
    if (evt.key === 'ShiftRight') {
      this.isShiftPressed = false;
      this.fpsRun = 1;
      settingsManager.cameraMovementSpeed = 0.003;
      settingsManager.cameraMovementSpeedMin = 0.005;
      this.speedModifier = 1;
    }
  }

  keyDownHandler(evt) {
    // Error Handling
    if (typeof evt.key == 'undefined') return;

    if (evt.key.toUpperCase() === 'SHIFT') {
      this.isShiftPressed = true;
      if (this.cameraType.current === this.cameraType.fps) {
        this.fpsRun = 0.05;
      }
      this.speedModifier = 8;
      settingsManager.cameraMovementSpeed = 0.003 / 8;
      settingsManager.cameraMovementSpeedMin = 0.005 / 8;
    }
    if (evt.key === 'ShiftRight') {
      this.isShiftPressed = true;
      if (this.cameraType.current === this.cameraType.fps) {
        this.fpsRun = 3;
      }
    }
    if (evt.key.toUpperCase() === 'W') {
      if (this.cameraType.current === this.cameraType.fps) {
        this.fpsForwardSpeed = settingsManager.fpsForwardSpeed;
        this.isFPSForwardSpeedLock = true;
      }
    }
    if (evt.key.toUpperCase() === 'A') {
      if (this.cameraType.current === this.cameraType.fps) {
        this.fpsSideSpeed = -settingsManager.fpsSideSpeed;
        this.isFPSSideSpeedLock = true;
      }
    }
    if (evt.key.toUpperCase() === 'S') {
      if (this.cameraType.current === this.cameraType.fps) {
        this.fpsForwardSpeed = -settingsManager.fpsForwardSpeed;
        this.isFPSForwardSpeedLock = true;
      }
    }
    if (evt.key.toUpperCase() === 'D') {
      if (this.cameraType.current === this.cameraType.fps) {
        this.fpsSideSpeed = settingsManager.fpsSideSpeed;
        this.isFPSSideSpeedLock = true;
      }
    }
    if (evt.key.toUpperCase() === 'I') {
      if (this.cameraType.current === this.cameraType.fps || this.cameraType.current === this.cameraType.satellite || this.cameraType.current === this.cameraType.astronomy) {
        this.fpsPitchRate = settingsManager.fpsPitchRate / this.speedModifier;
      }
    }
    if (evt.key.toUpperCase() === 'K') {
      if (this.cameraType.current === this.cameraType.fps || this.cameraType.current === this.cameraType.satellite || this.cameraType.current === this.cameraType.astronomy) {
        this.fpsPitchRate = -settingsManager.fpsPitchRate / this.speedModifier;
      }
    }
    if (evt.key.toUpperCase() === 'J') {
      if (this.cameraType.current === this.cameraType.fps || this.cameraType.current === this.cameraType.satellite) {
        this.fpsYawRate = -settingsManager.fpsYawRate / this.speedModifier;
      }
      if (this.cameraType.current === this.cameraType.astronomy) {
        this.fpsRotateRate = settingsManager.fpsRotateRate / this.speedModifier;
      }
    }
    if (evt.key.toUpperCase() === 'L') {
      if (this.cameraType.current === this.cameraType.fps || this.cameraType.current === this.cameraType.satellite) {
        this.fpsYawRate = settingsManager.fpsYawRate / this.speedModifier;
      }
      if (this.cameraType.current === this.cameraType.astronomy) {
        this.fpsRotateRate = -settingsManager.fpsRotateRate / this.speedModifier;
      }
    }
    if (evt.key.toUpperCase() === 'Q') {
      if (this.cameraType.current === this.cameraType.fps) {
        this.fpsVertSpeed = -settingsManager.fpsVertSpeed;
        this.isFPSVertSpeedLock = true;
      }
      if (this.cameraType.current === this.cameraType.satellite || this.cameraType.current === this.cameraType.astronomy) {
        this.fpsRotateRate = settingsManager.fpsRotateRate / this.speedModifier;
      }
    }
    if (evt.key.toUpperCase() === 'E') {
      if (this.cameraType.current === this.cameraType.fps) {
        this.fpsVertSpeed = settingsManager.fpsVertSpeed;
        this.isFPSVertSpeedLock = true;
      }
      if (this.cameraType.current === this.cameraType.satellite || this.cameraType.current === this.cameraType.astronomy) {
        this.fpsRotateRate = -settingsManager.fpsRotateRate / this.speedModifier;
      }
    }
  }

  _fpsMovement() {
    this.fpsTimeNow = Date.now();
    if (this.fpsLastTime !== 0) {
      this.fpsElapsed = this.fpsTimeNow - this.fpsLastTime;

      if (this.isFPSForwardSpeedLock && this.fpsForwardSpeed < 0) {
        this.fpsForwardSpeed = Math.max(this.fpsForwardSpeed + Math.min(this.fpsForwardSpeed * -1.02 * this.fpsElapsed, -0.2), -settingsManager.fpsForwardSpeed);
      } else if (this.isFPSForwardSpeedLock && this.fpsForwardSpeed > 0) {
        this.fpsForwardSpeed = Math.min(this.fpsForwardSpeed + Math.max(this.fpsForwardSpeed * 1.02 * this.fpsElapsed, 0.2), settingsManager.fpsForwardSpeed);
      }

      if (this.isFPSSideSpeedLock && this.fpsSideSpeed < 0) {
        this.fpsSideSpeed = Math.max(this.fpsSideSpeed + Math.min(this.fpsSideSpeed * -1.02 * this.fpsElapsed, -0.2), -settingsManager.fpsSideSpeed);
      } else if (this.isFPSSideSpeedLock && this.fpsSideSpeed > 0) {
        this.fpsSideSpeed = Math.min(this.fpsSideSpeed + Math.max(this.fpsSideSpeed * 1.02 * this.fpsElapsed, 0.2), settingsManager.fpsSideSpeed);
      }

      if (this.isFPSVertSpeedLock && this.fpsVertSpeed < 0) {
        this.fpsVertSpeed = Math.max(this.fpsVertSpeed + Math.min(this.fpsVertSpeed * -1.02 * this.fpsElapsed, -0.2), -settingsManager.fpsVertSpeed);
      } else if (this.isFPSVertSpeedLock && this.fpsVertSpeed > 0) {
        this.fpsVertSpeed = Math.min(this.fpsVertSpeed + Math.max(this.fpsVertSpeed * 1.02 * this.fpsElapsed, 0.2), settingsManager.fpsVertSpeed);
      }

      // console.log('Front: ' + fpsForwardSpeed + ' - ' + 'Side: ' + fpsSideSpeed + ' - ' + 'Vert: ' + fpsVertSpeed)

      if (this.cameraType.fps) {
        if (this.fpsForwardSpeed !== 0) {
          this.fpsXPos -= Math.sin(this.fpsYaw * DEG2RAD) * this.fpsForwardSpeed * this.fpsRun * this.fpsElapsed;
          this.fpsYPos -= Math.cos(this.fpsYaw * DEG2RAD) * this.fpsForwardSpeed * this.fpsRun * this.fpsElapsed;
          this.fpsZPos += Math.sin(this.fpsPitch * DEG2RAD) * this.fpsForwardSpeed * this.fpsRun * this.fpsElapsed;
        }
        if (this.fpsVertSpeed !== 0) {
          this.fpsZPos -= this.fpsVertSpeed * this.fpsRun * this.fpsElapsed;
        }
        if (this.fpsSideSpeed !== 0) {
          this.fpsXPos -= Math.cos(-this.fpsYaw * DEG2RAD) * this.fpsSideSpeed * this.fpsRun * this.fpsElapsed;
          this.fpsYPos -= Math.sin(-this.fpsYaw * DEG2RAD) * this.fpsSideSpeed * this.fpsRun * this.fpsElapsed;
        }
      }

      if (!this.isFPSForwardSpeedLock) this.fpsForwardSpeed *= Math.min(0.98 * this.fpsElapsed, 0.98);
      if (!this.isFPSSideSpeedLock) this.fpsSideSpeed *= Math.min(0.98 * this.fpsElapsed, 0.98);
      if (!this.isFPSVertSpeedLock) this.fpsVertSpeed *= Math.min(0.98 * this.fpsElapsed, 0.98);

      if (this.fpsForwardSpeed < 0.01 && this.fpsForwardSpeed > -0.01) this.fpsForwardSpeed = 0;
      if (this.fpsSideSpeed < 0.01 && this.fpsSideSpeed > -0.01) this.fpsSideSpeed = 0;
      if (this.fpsVertSpeed < 0.01 && this.fpsVertSpeed > -0.01) this.fpsVertSpeed = 0;

      this.fpsPitch += this.fpsPitchRate * this.fpsElapsed;
      this.fpsRotate += this.fpsRotateRate * this.fpsElapsed;
      this.fpsYaw += this.fpsYawRate * this.fpsElapsed;

      // console.log('Pitch: ' + fpsPitch + ' - ' + 'Rotate: ' + fpsRotate + ' - ' + 'Yaw: ' + fpsYaw)
    }
    this.fpsLastTime = this.fpsTimeNow;
  }

  _getCamDist() {
    return Math.pow(this.zoomLevel, ZOOM_EXP) * (settingsManager.maxZoomDistance - settingsManager.minZoomDistance) + settingsManager.minZoomDistance;
  }

  calculate(id, dt) {
    if (this.isPanning || this.panReset) {
      // If user is actively moving
      if (this.isPanning) {
        this.camPitchSpeed = 0;
        this.camYawSpeed = 0;
        this.panDif.x = this.screenDragPoint[0] - this.mouseX;
        this.panDif.y = this.screenDragPoint[1] - this.mouseY;
        this.panDif.z = this.screenDragPoint[1] - this.mouseY;

        // Slow down the panning if a satellite is selected
        if (id !== -1) {
          this.panDif.x /= 30;
          this.panDif.y /= 30;
          this.panDif.z /= 30;
        }

        this.panTarget.x = this.panStartPosition.x + this.panDif.x * this.panMovementSpeed * this.zoomLevel;
        if (this.isWorldPan) {
          this.panTarget.y = this.panStartPosition.y + this.panDif.y * this.panMovementSpeed * this.zoomLevel;
        }
        if (this.isScreenPan) {
          this.panTarget.z = this.panStartPosition.z + this.panDif.z * this.panMovementSpeed;
        }
      }

      if (this.panReset) {
        this.panTarget.x = 0;
        this.panTarget.y = 0;
        this.panTarget.z = 0;
        this.panDif.x = -this.panCurrent.x;
        this.panDif.y = this.panCurrent.y;
        this.panDif.z = this.panCurrent.z;
      }

      this.panResetModifier = this.panReset ? 0.5 : 1;

      // X is X no matter what
      this.panSpeed.x = (this.panCurrent.x - this.panTarget.x) * this.panMovementSpeed * this.zoomLevel;
      this.panSpeed.x -= this.panSpeed.x * dt * this.panMovementSpeed * this.zoomLevel;
      this.panCurrent.x += this.panResetModifier * this.panMovementSpeed * this.panDif.x;
      // If we are moving like an FPS then Y and Z are based on the angle of the camera
      if (this.isWorldPan) {
        this.fpsYPos -= Math.cos(this.localRotateCurrent.yaw) * this.panResetModifier * this.panMovementSpeed * this.panDif.y;
        this.fpsZPos += Math.sin(this.localRotateCurrent.pitch) * this.panResetModifier * this.panMovementSpeed * this.panDif.y;
        this.fpsYPos -= Math.sin(-this.localRotateCurrent.yaw) * this.panResetModifier * this.panMovementSpeed * this.panDif.x;
      }
      // If we are moving the screen then Z is always up and Y is not relevant
      if (this.isScreenPan || this.panReset) {
        this.panSpeed.z = (this.panCurrent.z - this.panTarget.z) * this.panMovementSpeed * this.zoomLevel;
        this.panSpeed.z -= this.panSpeed.z * dt * this.panMovementSpeed * this.zoomLevel;
        this.panCurrent.z -= this.panResetModifier * this.panMovementSpeed * this.panDif.z;
      }

      if (this.panReset) {
        this.fpsXPos = this.fpsXPos - this.fpsXPos / 25;
        this.fpsYPos = this.fpsYPos - this.fpsYPos / 25;
        this.fpsZPos = this.fpsZPos - this.fpsZPos / 25;

        if (this.panCurrent.x > -0.5 && this.panCurrent.x < 0.5) this.panCurrent.x = 0;
        if (this.panCurrent.y > -0.5 && this.panCurrent.y < 0.5) this.panCurrent.y = 0;
        if (this.panCurrent.z > -0.5 && this.panCurrent.z < 0.5) this.panCurrent.z = 0;
        if (this.fpsXPos > -0.5 && this.fpsXPos < 0.5) this.fpsXPos = 0;
        if (this.fpsYPos > -0.5 && this.fpsYPos < 0.5) this.fpsYPos = 0;
        if (this.fpsZPos > -0.5 && this.fpsZPos < 0.5) this.fpsZPos = 0;

        if (this.panCurrent.x == 0 && this.panCurrent.y == 0 && this.panCurrent.z == 0 && this.fpsXPos == 0 && this.fpsYPos == 0 && this.fpsZPos == 0) {
          this.panReset = false;
        }
      }
    }
    if (this.isLocalRotate || this.localRotateReset) {
      this.localRotateTarget.pitch = Camera.normalizeAngle(this.localRotateTarget.pitch);
      this.localRotateTarget.yaw = Camera.normalizeAngle(this.localRotateTarget.yaw);
      this.localRotateTarget.roll = Camera.normalizeAngle(this.localRotateTarget.roll);
      this.localRotateCurrent.pitch = Camera.normalizeAngle(this.localRotateCurrent.pitch);
      this.localRotateCurrent.yaw = Camera.normalizeAngle(this.localRotateCurrent.yaw);
      this.localRotateCurrent.roll = Camera.normalizeAngle(this.localRotateCurrent.roll);

      // If user is actively moving
      if (this.isLocalRotate) {
        this.localRotateDif.pitch = this.screenDragPoint[1] - this.mouseY;
        this.localRotateTarget.pitch = this.localRotateStartPosition.pitch + this.localRotateDif.pitch * -settingsManager.cameraMovementSpeed;
        this.localRotateSpeed.pitch = Camera.normalizeAngle(this.localRotateCurrent.pitch - this.localRotateTarget.pitch) * -settingsManager.cameraMovementSpeed;

        if (this.isLocalRotateRoll) {
          this.localRotateDif.roll = this.screenDragPoint[0] - this.mouseX;
          this.localRotateTarget.roll = this.localRotateStartPosition.roll + this.localRotateDif.roll * settingsManager.cameraMovementSpeed;
          this.localRotateSpeed.roll = Camera.normalizeAngle(this.localRotateCurrent.roll - this.localRotateTarget.roll) * -settingsManager.cameraMovementSpeed;
        }
        if (this.isLocalRotateYaw) {
          this.localRotateDif.yaw = this.screenDragPoint[0] - this.mouseX;
          this.localRotateTarget.yaw = this.localRotateStartPosition.yaw + this.localRotateDif.yaw * settingsManager.cameraMovementSpeed;
          this.localRotateSpeed.yaw = Camera.normalizeAngle(this.localRotateCurrent.yaw - this.localRotateTarget.yaw) * -settingsManager.cameraMovementSpeed;
        }
      }

      if (this.localRotateReset) {
        this.localRotateTarget.pitch = 0;
        this.localRotateTarget.roll = 0;
        this.localRotateTarget.yaw = 0;
        this.localRotateDif.pitch = -this.localRotateCurrent.pitch;
        this.localRotateDif.roll = -this.localRotateCurrent.roll;
        this.localRotateDif.yaw = -this.localRotateCurrent.yaw;
      }

      this.resetModifier = this.localRotateReset ? 750 : 1;

      this.localRotateSpeed.pitch -= this.localRotateSpeed.pitch * dt * this.localRotateMovementSpeed;
      this.localRotateCurrent.pitch += this.resetModifier * this.localRotateMovementSpeed * this.localRotateDif.pitch;

      if (this.isLocalRotateRoll || this.localRotateReset) {
        this.localRotateSpeed.roll -= this.localRotateSpeed.roll * dt * this.localRotateMovementSpeed;
        this.localRotateCurrent.roll += this.resetModifier * this.localRotateMovementSpeed * this.localRotateDif.roll;
      }

      if (this.isLocalRotateYaw || this.localRotateReset) {
        this.localRotateSpeed.yaw -= this.localRotateSpeed.yaw * dt * this.localRotateMovementSpeed;
        this.localRotateCurrent.yaw += this.resetModifier * this.localRotateMovementSpeed * this.localRotateDif.yaw;
      }

      if (this.localRotateReset) {
        if (this.localRotateCurrent.pitch > -0.001 && this.localRotateCurrent.pitch < 0.001) this.localRotateCurrent.pitch = 0;
        if (this.localRotateCurrent.roll > -0.001 && this.localRotateCurrent.roll < 0.001) this.localRotateCurrent.roll = 0;
        if (this.localRotateCurrent.yaw > -0.001 && this.localRotateCurrent.yaw < 0.001) this.localRotateCurrent.yaw = 0;
        if (this.localRotateCurrent.pitch == 0 && this.localRotateCurrent.roll == 0 && this.localRotateCurrent.yaw == 0) {
          this.localRotateReset = false;
        }
      }
    }
    if ((this.isDragging && !settingsManager.isMobileModeEnabled) || (this.isDragging && settingsManager.isMobileModeEnabled && (this.mouseX !== 0 || this.mouseY !== 0))) {
      // Disable Raycasting for Performance
      // dragTarget = getEarthScreenPoint(mouseX, mouseY)
      // if (isNaN(dragTarget[0]) || isNaN(dragTarget[1]) || isNaN(dragTarget[2]) ||
      // isNaN(dragPoint[0]) || isNaN(dragPoint[1]) || isNaN(dragPoint[2]) ||
      if (!this.isRayCastingEarth || this.cameraType.current === this.cameraType.fps || this.cameraType.current === this.cameraType.satellite || this.cameraType.current === this.cameraType.astronomy || settingsManager.isMobileModeEnabled) {
        // random screen drag
        this.xDif = this.screenDragPoint[0] - this.mouseX;
        this.yDif = this.screenDragPoint[1] - this.mouseY;
        this.yawTarget = this.dragStartYaw + this.xDif * settingsManager.cameraMovementSpeed;
        this.pitchTarget = this.dragStartPitch + this.yDif * -settingsManager.cameraMovementSpeed;
        this.camPitchSpeed = Camera.normalizeAngle(this.camPitch - this.pitchTarget) * -settingsManager.cameraMovementSpeed;
        this.camYawSpeed = Camera.normalizeAngle(this.camYaw - this.yawTarget) * -settingsManager.cameraMovementSpeed;
      } else {
        // This is how we handle a raycast that hit the earth to make it feel like you are grabbing onto the surface
        // of the earth instead of the screen
        /*
          // earth surface point drag
          // dragPointR = Math.sqrt(dragPoint[0] * dragPoint[0] + dragPoint[1] * dragPoint[1]);
          // dragTargetR = Math.sqrt(dragTarget[0] * dragTarget[0] + dragTarget[1] * dragTarget[1]);
          // dragPointLon = Math.atan2(dragPoint[1], dragPoint[0]);
          // dragTargetLon = Math.atan2(dragTarget[1], dragTarget[0]);
          // dragPointLat = Math.atan2(dragPoint[2], dragPointR);
          // dragTargetLat = Math.atan2(dragTarget[2], dragTargetR);
          // pitchDif = dragPointLat - dragTargetLat;
          // yawDif = Camera.normalizeAngle(dragPointLon - dragTargetLon);
          // this.camPitchSpeed = pitchDif * settingsManager.cameraMovementSpeed;
          // this.camYawSpeed = yawDif * settingsManager.cameraMovementSpeed;
        */
      }
      this.camSnapMode = false;
    } else {
      // This block of code is what causes the moment effect when moving the camera
      // Most applications like Goolge Earth or STK do not have this effect as pronounced
      // It makes KeepTrack feel more like a game and less like a toolkit
      if (!settingsManager.isMobileModeEnabled) {
        // DESKTOP ONLY
        this.camPitchSpeed -= this.camPitchSpeed * dt * settingsManager.cameraMovementSpeed * settingsManager.cameraDecayFactor; // decay speeds when globe is "thrown"
        this.camYawSpeed -= this.camYawSpeed * dt * settingsManager.cameraMovementSpeed * settingsManager.cameraDecayFactor;
      } else if (settingsManager.isMobileModeEnabled) {
        // MOBILE
        this.camPitchSpeed -= this.camPitchSpeed * dt * settingsManager.cameraMovementSpeed * settingsManager.cameraDecayFactor; // decay speeds when globe is "thrown"
        this.camYawSpeed -= this.camYawSpeed * dt * settingsManager.cameraMovementSpeed * settingsManager.cameraDecayFactor;
      }
    }
    if (this.ftsRotateReset) {
      if (this.cameraType.current !== this.cameraType.fixedToSat) {
        this.ftsRotateReset = false;
        this.ftsPitch = 0;
        this.camPitchSpeed = 0;
      }

      this.camPitchSpeed = settingsManager.cameraMovementSpeed * 0.2;
      this.camYawSpeed = settingsManager.cameraMovementSpeed * 0.2;

      if (this.camPitch >= this.ecPitch - 0.05 && this.camPitch <= this.ecPitch + 0.05) {
        this.camPitch = this.ecPitch;
        this.camPitchSpeed = 0;
      }
      if (this.camYaw >= this.ecYaw - 0.05 && this.camYaw <= this.ecYaw + 0.01) {
        this.camYaw = this.ecYaw;
        this.camYawSpeed = 0;
      }

      if (this.camYaw == this.ecYaw && this.camPitch == this.ecPitch) {
        this.ftsRotateReset = false;
      }

      if (this.camPitch > this.ecPitch) {
        this.camPitch -= this.camPitchSpeed * dt * settingsManager.cameraDecayFactor;
      } else if (this.camPitch < this.ecPitch) {
        this.camPitch += this.camPitchSpeed * dt * settingsManager.cameraDecayFactor;
      }

      if (this.camYaw > this.ecYaw) {
        this.camYaw -= this.camYawSpeed * dt * settingsManager.cameraDecayFactor;
      } else if (this.camYaw < this.ecYaw) {
        this.camYaw += this.camYawSpeed * dt * settingsManager.cameraDecayFactor;
      }
    }

    this.camRotateSpeed -= this.camRotateSpeed * dt * settingsManager.cameraMovementSpeed;

    if (this.cameraType.current === this.cameraType.fps || this.cameraType.current === this.cameraType.satellite || this.cameraType.current === this.cameraType.astronomy) {
      this.fpsPitch -= 20 * this.camPitchSpeed * dt;
      this.fpsYaw -= 20 * this.camYawSpeed * dt;
      this.fpsRotate -= 20 * this.camRotateSpeed * dt;

      // Prevent Over Rotation
      if (this.fpsPitch > 90) this.fpsPitch = 90;
      if (this.fpsPitch < -90) this.fpsPitch = -90;
      if (this.fpsRotate > 360) this.fpsRotate -= 360;
      if (this.fpsRotate < 0) this.fpsRotate += 360;
      if (this.fpsYaw > 360) this.fpsYaw -= 360;
      if (this.fpsYaw < 0) this.fpsYaw += 360;
    } else {
      this.camPitch += this.camPitchSpeed * dt;
      this.camYaw += this.camYawSpeed * dt;
      this.fpsRotate += this.camRotateSpeed * dt;
    }

    if (this.isRotateEarth) {
      this.camYaw -= settingsManager.autoRotateSpeed * dt;
    }

    // Zoom Changing
    // This code might be better if applied directly to the shader versus a multiplier effect
    if (this.zoomLevel !== this.zoomTarget) {
      if (this.zoomLevel > settingsManager.satShader.largeObjectMaxZoom) {
        settingsManager.satShader.maxSize = settingsManager.satShader.maxAllowedSize * 1.5;
      } else if (this.zoomLevel < settingsManager.satShader.largeObjectMinZoom) {
        settingsManager.satShader.maxSize = settingsManager.satShader.maxAllowedSize / 3;
      } else {
        settingsManager.satShader.maxSize = settingsManager.satShader.maxAllowedSize;
      }
    }

    if (this.camSnapMode) {
      this.camPitch += (this.camPitchTarget - this.camPitch) * this.chaseSpeed * dt;

      this.yawErr = Camera.normalizeAngle(this.camYawTarget - this.camYaw);
      this.camYaw += this.yawErr * this.chaseSpeed * dt;

      this.zoomLevel = this.zoomLevel + (this.zoomTarget - this.zoomLevel) * dt * 0.0025;
    } else {
      if (this.isZoomIn) {
        this.zoomLevel -= ((this.zoomLevel * dt) / 100) * Math.abs(this.zoomTarget - this.zoomLevel);
      } else {
        this.zoomLevel += ((this.zoomLevel * dt) / 100) * Math.abs(this.zoomTarget - this.zoomLevel);
      }

      if ((this.zoomLevel >= this.zoomTarget && !this.isZoomIn) || (this.zoomLevel <= this.zoomTarget && this.isZoomIn)) {
        this.zoomLevel = this.zoomTarget;
      }
    }

    if (this.cameraType.current == this.cameraType.fixedToSat) {
      this.camPitch = Camera.normalizeAngle(this.camPitch);
    } else {
      if (this.camPitch > TAU / 4) this.camPitch = TAU / 4;
      if (this.camPitch < -TAU / 4) this.camPitch = -TAU / 4;
    }
    if (this.camYaw > TAU) this.camYaw -= TAU;
    if (this.camYaw < 0) this.camYaw += TAU;

    if (this.cameraType.current == this.cameraType.default || this.cameraType.current == this.cameraType.offset) {
      this.ecPitch = this.camPitch;
      this.ecYaw = this.camYaw;
    } else if (this.cameraType.current == this.cameraType.fixedToSat) {
      this.ftsPitch = this.camPitch;
      this.ftsYaw = this.camYaw;
    }

    if (this.cameraType.current === this.cameraType.fps || this.cameraType.current === this.cameraType.satellite || this.cameraType.current === this.cameraType.astronomy) {
      this._fpsMovement();
    }
  }

  update(sat, sensorPos) {
    this.camMatrix = this.camMatrixEmpty;
    {
      glm.mat4.identity(this.camMatrix);

      /**
       * For FPS style movement rotate the camera and then translate it
       * for traditional view, move the camera and then rotate it
       */

      if (isNaN(this.camPitch) || isNaN(this.camYaw) || isNaN(this.camPitchTarget) || isNaN(this.camYawTarget) || isNaN(this.zoomLevel) || isNaN(this.zoomTarget)) {
        try {
          console.group('Camera Math Error');
          console.log(`camPitch: ${this.camPitch}`);
          console.log(`camYaw: ${this.camYaw}`);
          console.log(`camPitchTarget: ${this.camPitchTarget}`);
          console.log(`camYawTarget: ${this.camYawTarget}`);
          console.log(`zoomLevel: ${this.zoomLevel}`);
          console.log(`zoomTarget: ${this.zoomTarget}`);
          console.log(`settingsManager.cameraMovementSpeed: ${settingsManager.cameraMovementSpeed}`);
          console.groupEnd();
        } catch (e) {
          console.warn('Camera Math Error');
        }
        this.camPitch = 0.5;
        this.camYaw = 0.5;
        this.zoomLevel = 0.5;
        this.camPitchTarget = 0;
        this.camYawTarget = 0;
        this.zoomTarget = 0.5;
      }

      switch (this.cameraType.current) {
        case this.cameraType.default: // pivot around the earth with earth in the center
          glm.mat4.translate(this.camMatrix, this.camMatrix, [this.panCurrent.x, this.panCurrent.y, this.panCurrent.z]);
          glm.mat4.rotateX(this.camMatrix, this.camMatrix, -this.localRotateCurrent.pitch);
          glm.mat4.rotateY(this.camMatrix, this.camMatrix, -this.localRotateCurrent.roll);
          glm.mat4.rotateZ(this.camMatrix, this.camMatrix, -this.localRotateCurrent.yaw);
          glm.mat4.translate(this.camMatrix, this.camMatrix, [this.fpsXPos, this.fpsYPos, -this.fpsZPos]);
          glm.mat4.translate(this.camMatrix, this.camMatrix, [0, this._getCamDist(), 0]);
          glm.mat4.rotateX(this.camMatrix, this.camMatrix, this.ecPitch);
          glm.mat4.rotateZ(this.camMatrix, this.camMatrix, -this.ecYaw);
          break;
        case this.cameraType.offset: // pivot around the earth with earth offset to the bottom right
          glm.mat4.rotateX(this.camMatrix, this.camMatrix, -this.localRotateCurrent.pitch);
          glm.mat4.rotateY(this.camMatrix, this.camMatrix, -this.localRotateCurrent.roll);
          glm.mat4.rotateZ(this.camMatrix, this.camMatrix, -this.localRotateCurrent.yaw);

          glm.mat4.translate(this.camMatrix, this.camMatrix, [settingsManager.offsetCameraModeX, this._getCamDist(), settingsManager.offsetCameraModeZ]);
          glm.mat4.rotateX(this.camMatrix, this.camMatrix, this.ecPitch);
          glm.mat4.rotateZ(this.camMatrix, this.camMatrix, -this.ecYaw);
          break;
        case this.cameraType.fixedToSat: // Pivot around the satellite
          glm.mat4.rotateX(this.camMatrix, this.camMatrix, -this.localRotateCurrent.pitch);
          glm.mat4.rotateY(this.camMatrix, this.camMatrix, -this.localRotateCurrent.roll);
          glm.mat4.rotateZ(this.camMatrix, this.camMatrix, -this.localRotateCurrent.yaw);

          glm.mat4.translate(this.camMatrix, this.camMatrix, [0, this._getCamDist() - RADIUS_OF_EARTH - sat.getAltitude(), 0]);

          glm.mat4.rotateX(this.camMatrix, this.camMatrix, this.ftsPitch);
          glm.mat4.rotateZ(this.camMatrix, this.camMatrix, -this.ftsYaw);

          this.satPos = [-sat.position.x, -sat.position.y, -sat.position.z];
          glm.mat4.translate(this.camMatrix, this.camMatrix, this.satPos);
          break;
        case this.cameraType.fps: // FPS style movement
          glm.mat4.rotate(this.camMatrix, this.camMatrix, -this.fpsPitch * DEG2RAD, [1, 0, 0]);
          glm.mat4.rotate(this.camMatrix, this.camMatrix, this.fpsYaw * DEG2RAD, [0, 0, 1]);
          glm.mat4.translate(this.camMatrix, this.camMatrix, [this.fpsXPos, this.fpsYPos, -this.fpsZPos]);
          break;
        case this.cameraType.planetarium: {
          // Pitch is the opposite of the angle to the latitude
          // Yaw is 90 degrees to the left of the angle to the longitude
          this.pitchRotate = -1 * sensorPos.lat * DEG2RAD;
          this.yawRotate = (90 - sensorPos.long) * DEG2RAD - sensorPos.gmst;
          glm.mat4.rotate(this.camMatrix, this.camMatrix, this.pitchRotate, [1, 0, 0]);
          glm.mat4.rotate(this.camMatrix, this.camMatrix, this.yawRotate, [0, 0, 1]);

          glm.mat4.translate(this.camMatrix, this.camMatrix, [-sensorPos.x, -sensorPos.y, -sensorPos.z]);
          break;
        }
        case this.cameraType.satellite: {
          this.satPos = [-sat.position.x, -sat.position.y, -sat.position.z];
          glm.mat4.translate(this.camMatrix, this.camMatrix, this.satPos);
          glm.vec3.normalize(this.normUp, this.satPos);
          glm.vec3.normalize(this.normForward, [sat.velocity.x, sat.velocity.y, sat.velocity.z]);
          glm.vec3.transformQuat(this.normLeft, this.normUp, glm.quat.fromValues(this.normForward[0], this.normForward[1], this.normForward[2], 90 * DEG2RAD));
          this.satNextPos = [sat.position.x + sat.velocity.x, sat.position.y + sat.velocity.y, sat.position.z + sat.velocity.z];
          glm.mat4.lookAt(this.camMatrix, this.satNextPos, this.satPos, this.normUp);

          glm.mat4.translate(this.camMatrix, this.camMatrix, [sat.position.x, sat.position.y, sat.position.z]);

          glm.mat4.rotate(this.camMatrix, this.camMatrix, this.fpsPitch * DEG2RAD, this.normLeft);
          glm.mat4.rotate(this.camMatrix, this.camMatrix, -this.fpsYaw * DEG2RAD, this.normUp);

          glm.mat4.translate(this.camMatrix, this.camMatrix, this.satPos);
          break;
        }
        case this.cameraType.astronomy: {
          // Pitch is the opposite of the angle to the latitude
          // Yaw is 90 degrees to the left of the angle to the longitude
          this.pitchRotate = -1 * sensorPos.lat * DEG2RAD;

          let sensorPosU = [-sensorPos.x * 1.01, -sensorPos.y * 1.01, -sensorPos.z * 1.01];
          this.fpsXPos = sensorPos.x;
          this.fpsYPos = sensorPos.y;
          this.fpsZPos = sensorPos.z;

          glm.mat4.rotate(this.camMatrix, this.camMatrix, this.pitchRotate + -this.fpsPitch * DEG2RAD, [1, 0, 0]);
          glm.mat4.rotate(this.camMatrix, this.camMatrix, -this.fpsRotate * DEG2RAD, [0, 1, 0]);
          glm.vec3.normalize(this.normUp, sensorPosU);
          glm.mat4.rotate(this.camMatrix, this.camMatrix, -this.fpsYaw * DEG2RAD, this.normUp);

          glm.mat4.translate(this.camMatrix, this.camMatrix, [-sensorPos.x * 1.01, -sensorPos.y * 1.01, -sensorPos.z * 1.01]);
          break;
        }
      }
    }
  }
}

export { Camera };
