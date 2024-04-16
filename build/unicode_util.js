"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnicodeSet = void 0;
var CharCategory;
(function (CharCategory) {
    CharCategory[CharCategory["InvalidChar"] = 0] = "InvalidChar";
    CharCategory[CharCategory["NormalChar"] = 1] = "NormalChar";
    CharCategory[CharCategory["SurrogateChar"] = 2] = "SurrogateChar";
})(CharCategory || (CharCategory = {}));
class UnicodeSet {
    constructor(charRange, surrogateRange) {
        this.charRange = new Array();
        this.charSurrogateRange = new Array();
        this.fastTableSize = 256;
        this.fastTable = new Array(this.fastTableSize);
        this.fullTable = {};
        this.surrogateMap = {};
        this.isSlowTablesInitialized = false;
        this.charRange = charRange;
        if (surrogateRange !== undefined) {
            this.charSurrogateRange = surrogateRange;
        }
        this._buildTables(true);
        throw new Error("foobar");
    }
    lookup(char, nextChar) {
        if (char < this.fastTableSize) {
            return this.fastTable[char] === CharCategory.NormalChar;
        }
        // lazy build full table
        this._buildTables(false);
        this._buildSurrogateTables();
        this.isSlowTablesInitialized = true;
        if (nextChar !== undefined && this.fullTable[char] === CharCategory.SurrogateChar) {
            return this._lookupSurrogate(char, nextChar);
        }
        return this.fullTable[char] === CharCategory.NormalChar;
    }
    _lookupSurrogate(char, nextChar) {
        if (this.charSurrogateRange !== undefined && this.surrogateMap[char]) {
            return this.surrogateMap[char][nextChar] === CharCategory.SurrogateChar;
        }
        return false;
    }
    _buildTables(fastOnly) {
        for (const charSet of this.charRange) {
            for (let entryIndex = 0; entryIndex < charSet.length; entryIndex++) {
                const entry = charSet[entryIndex];
                let rangeStart;
                let rangeEnd;
                if (Array.isArray(entry)) {
                    rangeStart = entry[0];
                    rangeEnd = entry[1];
                }
                else {
                    rangeStart = rangeEnd = entry;
                }
                for (let i = rangeStart; i <= rangeEnd; i++) {
                    if (i < this.fastTableSize) {
                        this.fastTable[i] = CharCategory.NormalChar;
                    }
                    else {
                        this.fullTable[i] = CharCategory.NormalChar;
                    }
                }
                // exit early if only doing fast table
                if (fastOnly && rangeStart >= this.fastTableSize) {
                    break;
                }
            }
        }
    }
    _buildSurrogateTables() {
        if (this.charSurrogateRange === undefined) {
            return;
        }
        for (const charSet of this.charSurrogateRange) {
            for (const key in charSet) {
                if (!this.charSurrogateRange[key]) {
                    this.surrogateMap[key] = {};
                    this.fullTable[key] = CharCategory.SurrogateChar;
                }
                const _set = charSet[key];
                for (let entryIndex = 0; entryIndex < _set.length; entryIndex++) {
                    const entry = _set[entryIndex];
                    let rangeStart;
                    let rangeEnd;
                    if (Array.isArray(entry)) {
                        rangeStart = entry[0];
                        rangeEnd = entry[1];
                    }
                    else {
                        rangeStart = rangeEnd = entry;
                    }
                    for (let i = rangeStart; i <= rangeEnd; i++) {
                        this.surrogateMap[key][i] = CharCategory.SurrogateChar;
                    }
                }
            }
        }
    }
}
exports.UnicodeSet = UnicodeSet;
