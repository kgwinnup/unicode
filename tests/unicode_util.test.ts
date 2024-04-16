import { unicodeLu } from "../mod";
import { Unicode } from "../mod";

describe("sum module", () => {
    test("checks Lu group", () => {
        const uc = new Unicode([unicodeLu]);
        expect(uc.lookup("A".charCodeAt(0))).toBe(true);
    });
});
