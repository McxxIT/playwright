import { test as base } from '@playwright/test';
import { BubbleApi } from './bubble-api';

type Fixtures = {
  bubbleApi: BubbleApi;
};

export const test = base.extend<Fixtures>({
  bubbleApi: async ({}, use) => {
    await use(new BubbleApi());
  },
});

export { expect } from '@playwright/test';
