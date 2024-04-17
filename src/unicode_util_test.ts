import { Char, Unicode, UnicodeCategory } from "../mod.ts";
import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";

Deno.test("checks Lu group", () => {
    const uc = new Unicode([UnicodeCategory.unicodeLu]);
    assertEquals(uc.lookup(Char.A), true);
});
