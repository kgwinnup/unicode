import { unicodeLu } from './unicode';
import { UnicodeSet } from './unicode_util';

describe('sum module', () => {
    test('checks Lu group', () => {
        const uc = new UnicodeSet([unicodeLu]);
        expect(uc.lookup('A'.charCodeAt(0))).toBe(true);
    });
});
