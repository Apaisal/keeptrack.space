import { clickAndDragWidth } from '@app/lib/click-and-drag';
import { getEl } from '@app/lib/get-el';

import { KeepTrackApiEvents } from '@app/interfaces';
import { keepTrackApi } from '@app/keepTrackApi';
import { GroupType } from '@app/singletons/object-group';
import { StringExtractor } from '@app/static/string-extractor';
import flagPng from '@public/img/icons/flag.png';

import { SearchResult } from '@app/singletons/search-manager';
import { KeepTrackPlugin } from '../KeepTrackPlugin';
import { SelectSatManager } from '../select-sat-manager/select-sat-manager';
import { SoundNames } from '../sounds/SoundNames';

export class CountriesMenu extends KeepTrackPlugin {
  static PLUGIN_NAME = 'Countries Menu';
  constructor() {
    super(CountriesMenu.PLUGIN_NAME);
  }

  bottomIconElementName = 'menu-countries-icon';
  bottomIconImg = flagPng;
  bottomIconLabel = 'Countries';
  sideMenuElementHtml = keepTrackApi.html`
    <div id="countries-menu" class="side-menu-parent start-hidden text-select">
      <div id="country-menu" class="side-menu">
        <ul>
          <h5 class="center-align">Countries</h5>
          <li class="divider"></li>
          <li class="menu-selectable country-option" data-group="Argentina">Argentina</li>
          <li class="menu-selectable country-option" data-group="Austria">Austria</li>
          <li class="menu-selectable country-option" data-group="Australia">Australia</li>
          <li class="menu-selectable country-option" data-group="Belgium">Belgium</li>
          <li class="menu-selectable country-option" data-group="Brazil">Brazil</li>
          <li class="menu-selectable country-option" data-group="Canada">Canada</li>
          <li class="menu-selectable country-option" data-group="China">China</li>
          <li class="menu-selectable country-option" data-group="Colombia">Colombia</li>
          <li class="menu-selectable country-option" data-group="Denmark">Denmark</li>
          <li class="menu-selectable country-option" data-group="Egypt">Egypt</li>
          <li class="menu-selectable country-option" data-group="Finland">Finland</li>
          <li class="menu-selectable country-option" data-group="France">France</li>
          <li class="menu-selectable country-option" data-group="Germany">Germany</li>
          <li class="menu-selectable country-option" data-group="Hong Kong">Hong Kong</li>
          <li class="menu-selectable country-option" data-group="Hungary">Hungary</li>
          <li class="menu-selectable country-option" data-group="India">India</li>
          <li class="menu-selectable country-option" data-group="Indonesia">Indonesia</li>
          <li class="menu-selectable country-option" data-group="Iran">Iran</li>
          <li class="menu-selectable country-option" data-group="Ireland">Ireland</li>
          <li class="menu-selectable country-option" data-group="Italy">Italy</li>
          <li class="menu-selectable country-option" data-group="Israel">Israel</li>
          <li class="menu-selectable country-option" data-group="Japan">Japan</li>
          <li class="menu-selectable country-option" data-group="North Korea">North Korea</li>
          <li class="menu-selectable country-option" data-group="South Korea">South Korea</li>
          <li class="menu-selectable country-option" data-group="Mexico">Mexico</li>
          <li class="menu-selectable country-option" data-group="Norway">Norway</li>
          <li class="menu-selectable country-option" data-group="New Zealand">New Zealand</li>
          <li class="menu-selectable country-option" data-group="Philippines">Philippines</li>
          <li class="menu-selectable country-option" data-group="Poland">Poland</li>
          <li class="menu-selectable country-option" data-group="Russia">Russia</li>
          <li class="menu-selectable country-option" data-group="Saudi Arabia">Saudi Arabia</li>
          <li class="menu-selectable country-option" data-group="Singapore">Singapore</li>
          <li class="menu-selectable country-option" data-group="Spain">Spain</li>
          <li class="menu-selectable country-option" data-group="Sweden">Sweden</li>
          <li class="menu-selectable country-option" data-group="Switzerland">Switzerland</li>
          <li class="menu-selectable country-option" data-group="Thailand">Thailand</li>
          <li class="menu-selectable country-option" data-group="Turkey">Turkey</li>
          <li class="menu-selectable country-option" data-group="United Kingdom">United Kingdom</li>
          <li class="menu-selectable country-option" data-group="United States">United States</li>
          <li class="menu-selectable country-option" data-group="Venezuela">Venezuela</li>
          <li class="menu-selectable country-option" data-group="Vietnam">Vietnam</li>
          <li class="menu-selectable country-option" data-group="South Africa">South Africa</li>
        </ul>
      </div>
    </div>
    `;

  sideMenuElementName = 'countries-menu';
  helpTitle = `Countries Menu`;
  helpBody = keepTrackApi.html`The Countries Menu allows you to filter the satellites by country of origin.`;

  addJs() {
    super.addJs();

    keepTrackApi.register({
      event: KeepTrackApiEvents.uiManagerFinal,
      cbName: this.PLUGIN_NAME,
      cb: () => {
        getEl('country-menu')
          .querySelectorAll('li')
          .forEach((element) => {
            element.addEventListener('click', function () {
              keepTrackApi.getSoundManager()?.play(SoundNames.CLICK);
              CountriesMenu.countryMenuClick_(this.getAttribute('data-group'));
            });
          });

        clickAndDragWidth(getEl(this.sideMenuElementName));
      },
    });
  }

  private static countryMenuClick_(groupName: string): void {
    const groupManagerInstance = keepTrackApi.getGroupsManager();
    const countryCode = StringExtractor.getCountryCode(groupName);
    if (countryCode === '') throw new Error('Unknown country group');

    if (!groupManagerInstance.groupList[groupName]) {
      groupManagerInstance.createGroup(GroupType.COUNTRY, countryCode, groupName);
    }

    CountriesMenu.groupSelected_(groupName);
  }

  private static groupSelected_(groupName: string): void {
    const groupManagerInstance = keepTrackApi.getGroupsManager();
    const catalogManagerInstance = keepTrackApi.getCatalogManager();
    const uiManagerInstance = keepTrackApi.getUiManager();

    const searchDOM = <HTMLInputElement>getEl('search');
    if (typeof groupName == 'undefined') return;
    if (typeof groupManagerInstance.groupList[groupName] == 'undefined') return;
    groupManagerInstance.selectGroup(groupManagerInstance.groupList[groupName]);

    // Populate searchDOM with a search string separated by commas - minus the last one
    if (groupManagerInstance.groupList[groupName].ids.length < settingsManager.searchLimit) {
      uiManagerInstance.searchManager.doSearch(
        groupManagerInstance.groupList[groupName].ids.reduce((acc: string, id: number) => `${acc}${catalogManagerInstance.getSat(id)?.sccNum},`, '').slice(0, -1)
      );
    } else {
      searchDOM.value = groupManagerInstance.groupList[groupName].ids.reduce((acc: string, id: number) => `${acc}${catalogManagerInstance.getSat(id)?.sccNum},`, '').slice(0, -1);
      uiManagerInstance.searchManager.fillResultBox(
        groupManagerInstance.groupList[groupName].ids.map((id: number) => <SearchResult>{ id: id }),
        catalogManagerInstance
      );
    }

    // If a selectSat plugin exists, deselect the selected satellite
    keepTrackApi.getPlugin(SelectSatManager)?.selectSat(-1);

    // Close Menus
    if (settingsManager.isMobileModeEnabled) uiManagerInstance.searchManager.closeSearch();
    uiManagerInstance.hideSideMenus();
  }
}

export const countriesMenuPlugin = new CountriesMenu();
