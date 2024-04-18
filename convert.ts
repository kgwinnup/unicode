type UnicodeRange = [number, number] | number;
type UnicodeRangeTable = UnicodeRange[];
type UnicodeSurrogateRangeTable = {
    [surrogate: number]: UnicodeRange[];
};

function convert(n: number): UnicodeRange {
    if (n >= 0x10000 && n <= 0x10FFFF) {
        const hi = Math.floor((n - 0x10000) / 0x400) + 0xD800;
        const lo = ((n - 0x10000) % 0x400) + 0xDC00;
        return [hi, lo];
    } else {
        return n;
    }
}

function output(category: string, table: UnicodeRangeTable, surrogateTable: UnicodeSurrogateRangeTable): string {
    let out = "";

    //export const unicodeCc: UnicodeRangeTable = [
    //    [0x0000, 0x001f],
    //    0x009f,
    //];
    if (table !== undefined && table.length > 0) {
        out += "export const " + category + ": UnicodeRangeTable = [\n";
        for (const range of table) {
            if (Array.isArray(range)) {
                const first = "0x" + range[0].toString(16).padStart(4, "0");
                const second = "0x" + range[1].toString(16).padStart(4, "0");
                out += "[" + first + ", " + second + "],\n";
            } else {
                out += "0x" + range.toString(16).padStart(4, "0") + ",\n";
            }
        }
        out += "];\n";
    }

    if (surrogateTable !== undefined && Object.keys(surrogateTable).length > 0) {
        out += "export const surrogate" + category + ": UnicodeSurrogateRangeTable = {\n";
        for (const [key, val] of Object.entries(surrogateTable)) {
            if (val.length == 0) {
                continue;
            }

            const keyInt = "0x" + parseInt(key).toString(16).padStart(4, "0");
            out += keyInt + ": [\n";
            for (let i = 0; i < val.length; i++) {
                if (Array.isArray(val[i])) {
                    const arr = val[i] as [number, number];
                    const start = "0x" + arr[0].toString(16).padStart(4, "0");
                    const end = "0x" + arr[1].toString(16).padStart(4, "0");
                    out += "[" + start + ", " + end + "],\n";
                } else {
                    out += "0x" + val[i].toString(16).padStart(4, "0") + ",\n";
                }
            }
            out += "],\n";
        }
        out += "};\n";
    }

    return out;
}

type TableMap = {
    [key: string]: UnicodeRangeTable;
};

type SurrogateTableMap = {
    [key: string]: UnicodeSurrogateRangeTable;
};

async function main() {
    const filePath = Deno.args[0];
    const text = await Deno.readTextFile(filePath);
    const lines = text.split("\n");

    // map of list of ranges
    // { "Ll": [ 0x0041, [0x0065, 0x0075], ...  ]}
    const table: TableMap = {};
    // { "Ll": { 0xd080: [ 0x0041, [0x0065, 0x0075], ...  ]}}
    const surrogateTable: SurrogateTableMap = {};
    const categories: Set<string> = new Set();

    for (const line of lines) {
        // skip comments
        if (line.charAt(0) == "#") {
            continue;
        }

        const firstSplit = line.split(";");
        if (firstSplit.length != 2) {
            continue;
        }

        let category = "";
        // get the category
        const regex = /#\ [A-Z][a-z&]\ /;
        const found = firstSplit[1].match(regex);
        if (found == null || found.length != 1) {
            throw new Error(`regex match error: invalid match ${line}`);
        }
        category = found[0].trim().substring(2);
        if (category == "L&") {
            categories.add("L");
            category = "L";
        } else {
            categories.add(category);
        }

        if (!table[category]) {
            table[category] = [];
        }

        if (!surrogateTable[category]) {
            surrogateTable[category] = {};
        }

        if (table) {
            if (firstSplit[0].includes("..")) {
                const ranges = firstSplit[0].split("..");
                if (ranges.length != 2) {
                    throw new Error(`range error: line contains invalid range '${line}'`);
                }

                const first = convert(parseInt(ranges[0].trim(), 16));
                const second = convert(parseInt(ranges[1].trim(), 16));

                if (Number.isInteger(first) && Number.isInteger(second)) {
                    const temp = table[category];
                    temp.push([first as number, second as number]);
                    continue;
                }

                if (Array.isArray(first) && Array.isArray(second)) {
                    const temp = surrogateTable[category];
                    const key = first[0];
                    const range1 = first[1];
                    const range2 = second[1];
                    if (!temp[key]) {
                        temp[key] = [];
                    }

                    temp[key].push([range1, range2]);
                    continue;
                }

                throw new Error(`error adding ranged unicode set: ${line}`);
            } else {
                const val = convert(parseInt(firstSplit[0].trim(), 16));
                if (Array.isArray(val)) {
                    const temp = surrogateTable[category];
                    const start = val[0];
                    const end = val[1];
                    if (!temp[start]) {
                        temp[start] = [];
                    }
                    temp[start].push(end);
                    continue;
                }

                if (Number.isInteger(val)) {
                    const temp = table[category];
                    temp.push(val);
                    continue;
                }

                throw new Error(`error adding unicode val: ${line}`);
            }
        }
    }

    let out = `type UnicodeRange = [number, number] | number;
    type UnicodeRangeTable = UnicodeRange[];
    type UnicodeSurrogateRangeTable = {
        [surrogate: number]: UnicodeRange[];
    };\n`;

    for (const cat of categories) {
        const normal = table[cat];
        const surrogate = surrogateTable[cat];
        out += output(cat, normal, surrogate);
    }

    console.log(out);
}

if (import.meta.main) main();
