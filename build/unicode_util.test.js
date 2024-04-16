"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unicode_1 = require("./unicode");
const unicode_util_1 = require("./unicode_util");
describe('sum module', () => {
    test('checks Lu group', () => {
        const uc = new unicode_util_1.UnicodeSet([unicode_1.unicodeLu]);
        expect(uc.lookup('A'.charCodeAt(0))).toBe(true);
    });
});
