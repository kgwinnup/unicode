import { unicodeLu } from './unicode';
import { Unicode } from './unicode_util';

describe('sum module', () => {
    test('checks Lu group', () => {
        const uc = new Unicode([unicodeLu]);
        expect(uc.lookup('A'.charCodeAt(0))).toBe(true);
    });
});
