import React from 'react';
import waitForCond from 'wait-for-cond';

import popoverMenuDriverFactory from './PopoverMenu.driver';
import PopoverMenu from './PopoverMenu';
import PopoverMenuItem from '../PopoverMenuItem/PopoverMenuItem';
import { createDriverFactory } from 'wix-ui-test-utils/driver-factory';
import {
  isTestkitExists,
  isEnzymeTestkitExists,
} from '../../test/utils/testkit-sanity';
import { popoverMenuTestkitFactory } from '../../testkit';
import { popoverMenuTestkitFactory as enzymePopoverMenuTestkitFactory } from '../../testkit/enzyme';
import { mount } from 'enzyme';

const waitFor = fn => waitForCond.assert(fn, 5000);

afterEach(() => {
  // under the hood PopoverMenu uses Tooltip component, which renders straight into document.body
  // thus need to keep it maintained
  document.body.innerHTML = '';
});

const menuItemDataHook = 'myItemDataHook';

describe('PopoverMenu', () => {
  const createDriver = createDriverFactory(popoverMenuDriverFactory);

  it('should render trigger button', () => {
    const driver = createDriver(<PopoverMenu />);

    expect(driver.exists()).toBe(true);
  });

  it('should render popover menu on trigger button click', async () => {
    const menuItem1Text = 'Menu Item';
    const menuItem1Listener = jest.fn();

    const driver = createDriver(
      <PopoverMenu>
        <PopoverMenuItem
          dataHook={menuItemDataHook}
          text={menuItem1Text}
          onClick={menuItem1Listener}
        />
        <PopoverMenuItem dataHook={menuItemDataHook} text="Menu Item #2" />
      </PopoverMenu>,
    ).init.menuItemDataHook(menuItemDataHook);

    driver.click();

    await waitFor(() => {
      expect(driver.menu.isShown()).toBe(true);
    });

    expect(driver.menu.itemsLength()).toBe(2);
    expect(driver.menu.itemContentAt(0)).toBe(menuItem1Text);

    driver.menu.clickItemAt(0);
    expect(menuItem1Listener).toBeCalled();

    await waitFor(() => {
      expect(driver.menu.isShown()).toBe(false);
    });
  });

  it('should not render non-existing items', async () => {
    const driver = createDriver(
      <PopoverMenu>
        <PopoverMenuItem dataHook={menuItemDataHook} text="Menu Item #1" />
        {false && (
          <PopoverMenuItem dataHook={menuItemDataHook} text="Menu Item #2" />
        )}
      </PopoverMenu>,
    ).init.menuItemDataHook(menuItemDataHook);

    driver.click();

    await waitFor(() => {
      expect(driver.menu.isShown()).toBe(true);
    });

    expect(driver.menu.itemsLength()).toBe(1);
  });

  it('should render item disabled', async () => {
    const menuItem1Listener = jest.fn();
    const driver = createDriver(
      <PopoverMenu>
        <PopoverMenuItem
          dataHook={menuItemDataHook}
          onClick={menuItem1Listener}
          disabled
        />
      </PopoverMenu>,
    ).init.menuItemDataHook(menuItemDataHook);

    driver.click();

    await waitFor(() => {
      expect(driver.menu.isShown()).toBe(true);
    });

    driver.menu.clickItemAt(0);
    expect(menuItem1Listener).not.toBeCalled();
  });

  it('should not render arrow when prop showArrow=false', async () => {
    const driver = createDriver(
      <PopoverMenu showArrow={false}>
        <PopoverMenuItem dataHook={menuItemDataHook} />
      </PopoverMenu>,
    ).init.menuItemDataHook(menuItemDataHook);
    driver.click();

    await waitFor(() => {
      expect(driver.menu.isShown()).toBe(true);
    });

    expect(driver.menu.hasArrow()).toBeFalsy();
  });
});

describe('Testkits', () => {
  const genPopoverMenuElement = () => (
    <PopoverMenu>
      <PopoverMenuItem text="Menu Item #1" />
      <PopoverMenuItem text="Menu Item #2" />
    </PopoverMenu>
  );

  it('Using ReactTestUtils testkit', () => {
    expect(
      isTestkitExists(genPopoverMenuElement(), popoverMenuTestkitFactory),
    ).toBe(true);
  });

  it('Using Enzyme testkit', () => {
    expect(
      isEnzymeTestkitExists(
        genPopoverMenuElement(),
        enzymePopoverMenuTestkitFactory,
        mount,
      ),
    ).toBe(true);
  });
});
