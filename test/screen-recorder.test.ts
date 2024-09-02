/* eslint-disable dot-notation */
import { KeepTrackApiEvents } from '@app/interfaces';
import { keepTrackApi } from '@app/keepTrackApi';
import { ScreenRecorder } from '@app/plugins/screen-recorder/screen-recorder';
import { setupDefaultHtml } from './environment/standard-env';
import { standardPluginSuite, websiteInit } from './generic-tests';

describe('ScreenRecorder_class', () => {
  let screenRecorderPlugin: ScreenRecorder;

  beforeEach(() => {
    setupDefaultHtml();
    screenRecorderPlugin = new ScreenRecorder();
  });

  standardPluginSuite(ScreenRecorder, 'ScreenRecorder');
  // standardPluginMenuButtonTests(ScreenRecorder, 'ScreenRecorder');

  // Tests stopping a video
  test('ScreenRecorder_stop_video', () => {
    websiteInit(screenRecorderPlugin);

    screenRecorderPlugin['streamManagerInstance_'].isVideoRecording = true;
    screenRecorderPlugin['streamManagerInstance_']['mediaRecorder_'] = {
      stop: () => { },
    } as any;
    screenRecorderPlugin['streamManagerInstance_']['stream_'] = {
      getTracks: () => [],
    } as any;
    screenRecorderPlugin['streamManagerInstance_'].save = () => { };

    expect(() => keepTrackApi.runEvent(KeepTrackApiEvents.bottomMenuClick, screenRecorderPlugin.bottomIconElementName)).not.toThrow();
  });

  // Tests error handling
  test('ScreenRecorder_error_checking', () => {
    websiteInit(screenRecorderPlugin);

    screenRecorderPlugin['streamManagerInstance_'].start = () => {
      throw new Error('test');
    };

    expect(() => keepTrackApi.runEvent(KeepTrackApiEvents.bottomMenuClick, screenRecorderPlugin.bottomIconElementName)).not.toThrow();
  });
});
