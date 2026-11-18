import { expect, test } from './../support/fixtures';
import { env } from '../support/env';
import { uniqueName } from '../support/bubble-helpers';

/**
 * These specs are a template for Data API-backed tests. They are skipped
 * until BUBBLE_API_TOKEN and BUBBLE_TEST_TYPE are set in .env.
 */
test.describe('Bubble Data API', () => {
  test.skip(!env.hasApiAccess, 'Set BUBBLE_API_TOKEN and BUBBLE_TEST_TYPE to enable these tests');

  test('lists records of the configured data type', async ({ bubbleApi }) => {
    const page = await bubbleApi.list(env.testType, { limit: 5 });
    expect(Array.isArray(page.results)).toBe(true);
    expect(page.count).toBeGreaterThanOrEqual(0);
  });

  test('creates, reads and deletes a record', async ({ bubbleApi }) => {
    test.skip(!env.testFields, 'Set BUBBLE_TEST_FIELDS to enable the create/delete test');

    const fields = { ...(env.testFields ?? {}), Name: uniqueName() };
    const id = await bubbleApi.create(env.testType, fields);

    try {
      const record = await bubbleApi.get(env.testType, id);
      expect(record._id).toBe(id);
    } finally {
      await bubbleApi.remove(env.testType, id);
    }
  });
});
