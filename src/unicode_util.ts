import { Char } from "./chars.ts";
import * as unicode from "./unicode.ts";

enum CharCategory {
  InvalidChar = 0,
  NormalChar = 1,
  SurrogateChar = 2,
}

type CharCategoryMap = {
  [code: number]: CharCategory;
};

export class Unicode {
  charRange: unicode.UnicodeRangeTable[] = new Array();
  charSurrogateRange: unicode.UnicodeSurrogateRangeTable[] = new Array();
  fastTableSize: number = 256;
  fastTable: CharCategory[] = new Array(this.fastTableSize);
  fullTable: CharCategoryMap = {};
  surrogateMap: { [code: number]: CharCategoryMap } = {};
  isSlowTablesInitialized = false;

  constructor(
    charRange: unicode.UnicodeRangeTable[],
    surrogateRange?: unicode.UnicodeSurrogateRangeTable[]
  ) {
    this.charRange = charRange;
    if (surrogateRange !== undefined) {
      this.charSurrogateRange = surrogateRange;
    }
    this._buildTables(true);
  }

  static isNumber(char: number): boolean {
    return char >= Char._0 && char <= Char._9;
  }

  static isHex(char: number): boolean {
    return (
      Unicode.isNumber(char) ||
      (char >= Char.a && char <= Char.f) ||
      (char >= Char.A && char <= Char.F)
    );
  }

  static isOctal(ch: number): boolean {
    return ch >= Char._0 && ch <= Char._7;
  }

  static isBinary(ch: number): boolean {
    return ch === Char._0 || ch === Char._1;
  }

  public lookup(char: number, nextChar?: number): boolean {
    if (char < this.fastTableSize) {
      return this.fastTable[char] === CharCategory.NormalChar;
    }

    // lazy build full table
    this._buildTables(false);
    this._buildSurrogateTables();
    this.isSlowTablesInitialized = true;

    if (
      nextChar !== undefined &&
      this.fullTable[char] === CharCategory.SurrogateChar
    ) {
      return this._lookupSurrogate(char, nextChar);
    }

    return this.fullTable[char] === CharCategory.NormalChar;
  }

  private _lookupSurrogate(char: number, nextChar: number): boolean {
    if (this.charSurrogateRange !== undefined && this.surrogateMap[char]) {
      return this.surrogateMap[char][nextChar] === CharCategory.SurrogateChar;
    }

    return false;
  }

  private _buildTables(fastOnly: boolean) {
    for (const charSet of this.charRange) {
      for (let entryIndex = 0; entryIndex < charSet.length; entryIndex++) {
        const entry = charSet[entryIndex];
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
            this.fastTable[i] = CharCategory.NormalChar;
          } else {
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

  private _buildSurrogateTables() {
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
          let rangeStart: number;
          let rangeEnd: number;

          if (Array.isArray(entry)) {
            rangeStart = entry[0];
            rangeEnd = entry[1];
          } else {
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
