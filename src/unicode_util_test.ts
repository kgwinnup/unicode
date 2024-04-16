import { UnicodeSet } from "./unicode_util.ts";
import * as unicode from "./unicode.ts";
import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";

Deno.test("testing index file", () => {
    let uc = new UnicodeSet([unicode.unicodeLu, unicode.unicodeLm, unicode.unicodeLo], []);
    assertEquals(true, uc.lookup("A".charCodeAt(0)));
});
