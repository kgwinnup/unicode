import { Char, Unicode, UnicodeCategory } from "../mod.ts";
import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";

Deno.test("checks L group", () => {
    const uc = new Unicode([UnicodeCategory.Lu]);
    assertEquals(uc.lookup(Char.A), true);
});

Deno.test("checks surrogate char", () => {
    const str = "𐐀";
    // UnicodeCategory.L is all letters
    const uc = new Unicode([UnicodeCategory.L], [UnicodeCategory.surrogateL]);
    assertEquals(uc.lookup(str.charCodeAt(0), str.charCodeAt(1)), true);

    // https://www.compart.com/en/unicode/U+10EAD
    // this char should not be a letter
    const str2 = "𐺭";
    assertEquals(uc.lookup(str2.charCodeAt(0), str2.charCodeAt(1)), false);

    // you can also check if the first char is a surrogate char
    assertEquals(uc.isSurrogate(str2.charCodeAt(0)), true);
});
