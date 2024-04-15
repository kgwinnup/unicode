import { Char } from "./powershell/chars.ts";
import * as unicode from "./powershell/unicode.ts";

enum CharCategory {
    InvalidChar = 0,
    NormalChar = 1,
    SurrogateChar = 2,
}

type CharCategoryMap = { [code: number]: CharCategory };

const _identifierCharSurrogateRanges = [
    unicode.unicodeMnSurrogate,
    unicode.unicodeMcSurrogate,
    unicode.unicodeNdSurrogate,
];

export class UnicodeUtil {
    charRange: unicode.UnicodeRangeTable[] = [];
    fastTableSize: number = 256;
    fastTable: CharCategory[] = new Array(this.fastTableSize);
    fullTable: CharCategoryMap = {};
    surrogateMap: { [code: number]: CharCategoryMap } = {};
    isSurrogateMapInitialized = false;

    constructor(charRange: unicode.UnicodeRangeTable[]) {
        this.charRange = charRange;
        this._buildTable(true);
    }

    lookup(char: number, nextChar?: number) {
        if (char < this.fastTableSize) {
            return this.fastTable[char] === CharCategory.NormalChar;
        }

        if (!this.isSurrogateMapInitialized) {
            this._buildTable(false);
            this.isSurrogateMapInitialized = true;
        }
    }

    private _buildTable(fastTableOnly: boolean) {
        this.fastTable.fill(CharCategory.InvalidChar);
        this.charRange.forEach((table) => {
            this._buildLookupTable(table, CharCategory.NormalChar, fastTableOnly);
        });

        //if (!fastTableOnly) {
        //    for (const surrogateTable of this.slowCharRange) {
        //        this._buildLookupTableFromSurrogateRangeTable(surrogateTable, CharCategory.StartIdentifierChar);
        //    }
        //}
    }

    private _buildLookupTable(table: unicode.UnicodeRangeTable, category: CharCategory, fastTableOnly: boolean) {
        for (let entryIndex = 0; entryIndex < table.length; entryIndex++) {
            const entry = table[entryIndex];
            let rangeStart: number;
            let rangeEnd: number;

            if (Array.isArray(entry)) {
                rangeStart = entry[0];
                rangeEnd = entry[1];
            } else {
                rangeStart = rangeEnd = entry;
            }

            for (let i = rangeStart; i <= rangeEnd; i++) {
                if (i < this.fastTableSize) {
                    this.fastTable[i] = category;
                } else {
                    this.fullTable[i] = category;
                }
            }

            if (fastTableOnly && rangeStart >= this.fastTableSize) {
                break;
            }
        }
    }

    private _buildSurrogateTable(surrogateTable: unicode.UnicodeSurrogateRangeTable, category: CharCategory) {
        for (const surrogateChar in surrogateTable) {
            if (!this.surrogateMap[surrogateChar]) {
                this.surrogateMap[surrogateChar] = {};
                this.charRange[surrogateChar] = CharCategory.SurrogateChar;
            }

            _buildIdentifierLookupTableFromUnicodeRangeTable(
                surrogateTable[surrogateChar],
                category,
                /* fastTableOnly */ false,
                _surrogateCharMap[surrogateChar],
                _surrogateCharMap[surrogateChar],
            );
        }
    }
}
