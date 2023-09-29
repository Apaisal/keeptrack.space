import { MultiSiteLookAnglesPlugin } from '@app/js/plugins/sensor/multi-site-look-angles-plugin';
import { setupStandardEnvironment } from './environment/standard-env';
import { standardChangeTests, standardClickTests, standardPluginMenuButtonTests, standardPluginSuite } from './generic-tests';

describe('MultiSiteLookAnglesPlugin_class', () => {
  beforeEach(() => {
    setupStandardEnvironment([]);
  });

  afterEach(() => {
    jest.advanceTimersByTime(1000);
  });

  standardPluginSuite(MultiSiteLookAnglesPlugin);
  standardPluginMenuButtonTests(MultiSiteLookAnglesPlugin);
  standardClickTests(MultiSiteLookAnglesPlugin);
  standardChangeTests(MultiSiteLookAnglesPlugin);
});
