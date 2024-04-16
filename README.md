[![JSR](https://jsr.io/badges/@kgwinnup/unicode)](https://jsr.io/@kgwinnup/unicode)

# Unicode library for javascript/typescript

This is an export of the unicode typescript helpers built into the
[pyright](https://github.com/microsoft/pyright). I've wrapped it in a small
`Unicode` interface to allow generic use of building and checking membership for
various unicode sets.

# Usage

```
import { unicodeLu, unicodeLo } from './unicode';
import { Unicode } from './unicode_util';

const uc = new Unicode([unicodeLu, unicodeLo]);
if (uc.lookup('A'.charCodeAt(0)) == true) {
    console.log("part of set")
}
```
