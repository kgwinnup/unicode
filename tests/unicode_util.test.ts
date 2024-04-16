import { UnicodeCategory, Unicode, Char } from "../mod";

describe("sum module", () => {
    test("checks Lu group", () => {
        const uc = new Unicode([UnicodeCategory.unicodeLu]);
        expect(uc.lookup("A".charCodeAt(0))).toBe(true);
        expect(uc.lookup(Char.A)).toBe(true);
    });
});
