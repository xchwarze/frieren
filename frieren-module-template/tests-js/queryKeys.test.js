/*
 * Project: Frieren Framework — module template
 * Example plain-logic Vitest test — no rendering, no JSX. Named `.test.js` on purpose (see
 * vitest.config.js's `include`) to show a pure-logic test doesn't need a `.jsx` filename.
 */
import { DEMO_GET_SYSTEM_STATS } from '@module/feature/helpers/queryKeys.js';

describe('demo query keys', () => {
    it('follows the documented FEATURE_ACTION kebab-case convention', () => {
        expect(DEMO_GET_SYSTEM_STATS).toBe('demo-get-system-stats');
    });
});
