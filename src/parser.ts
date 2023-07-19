import { TemplateLoader } from "./templateLoader";
import type { Template } from "./templateLoader";
import { WaveInfo } from "./waveinfo";

export class PopParser {
    protected raw_pop: string[];
    protected pop_dict: Map<string, any>;
    protected lines: string[];
    public templateLoader: TemplateLoader = new TemplateLoader();

    protected waves : Array<WaveInfo> = []

    constructor() {}

    giveRawData(raw_data: string){
        this.lines = raw_data.split("\n");
        console.log("Parser initiated");
        let v: number;
        [this.pop_dict, v] = this.read_pop(0);
        console.log("Printing pop file as dictionary: ", this.pop_dict);
    }
    getPopDict(): Map<string, any> {
        return this.pop_dict;
    }

    read_pop(startpos: number = 0): [Map<string, any>, number] {
        let pos: number = startpos;
        const scope_map: Map<string, any> = new Map();
        let skippos: number = -1;
        let prev_line: string = "";

        for (const line of this.lines.slice(startpos)) {
            if (skippos >= pos) {
                pos += 1;
                continue;
            }

            const lineParts: string[] = line.trim().split(/\s+/);

            if (lineParts.length === 0) {
                pos += 1;
                continue;
            }

            if (line.trim().startsWith("//")) {
                pos += 1;
                continue;
            }

            if (lineParts[0] === "{") {
                if (prev_line !== "") {
                    const attribute: string = this.parse_line(prev_line)[0];
                    const [r, innerSkippos] = this.read_pop(pos + 1);

                    if (scope_map.has(attribute) && scope_map.get(attribute) instanceof Map) {
                        const old: any[] = [scope_map.get(attribute)];
                        old.push(r);
                        scope_map.set(attribute, old);
                    } else if (
                        scope_map.has(attribute) &&
                        Array.isArray(scope_map.get(attribute)) &&
                        scope_map.get(attribute).length > 0
                    ) {
                        scope_map.get(attribute).push(r);
                    } else {
                        scope_map.set(attribute, r);
                    }
                    skippos = innerSkippos;
                } else {
                    console.log(prev_line, startpos, startpos + pos)
                    throw new Error("Section started but it has no name?");
                }
                pos += 1;
                continue;
            }

            if (line.trim() === "}") {
                return [scope_map, pos];
            }

            const p_line: string[] = this.parse_line(line);

            if (p_line.length === 1) {
                if (p_line[0] !== "") { prev_line = p_line[0]; }
            } else if (p_line.length > 1) {
                const attribute: string = p_line[0];
                const value: string = p_line[1].trim();

                if (
                    scope_map.has(attribute) &&
                    Array.isArray(scope_map.get(attribute)) &&
                    scope_map.get(attribute).length > 0
                ) {
                    scope_map.get(attribute).push(value);
                } else if (scope_map.has(attribute) && typeof scope_map.get(attribute) === "string") {
                    const old: any[] = [scope_map.get(attribute)];
                    old.push(value);
                    scope_map.set(attribute, old);
                } else {
                    scope_map.set(attribute, value);
                }
            }

            pos += 1;
        }
        scope_map.forEach((value, key) => {
            //console.log(`Key: ${key}, Value: ${value}`);
        });
        return [scope_map, pos];

    }

    parse_line(line: string): string[] {
        const split_list: string[] = line.trim().split(/\s+/);
        const tr_list: string[] = [];
        let looking_for_pair: boolean = false;

        for (const w of split_list) {
            if (w.startsWith("//")) {
                break;
            }

            if (w[0] === '"' && w[w.length - 1] !== '"') {
                looking_for_pair = true;
                tr_list.push(w);
            } else if (looking_for_pair) {
                tr_list[tr_list.length - 1] += " " + w;
                if (w[0] !== '"' && w[w.length - 1] === '"') {
                    looking_for_pair = false;
                }
            } else {
                tr_list.push(w);
            }
        }
        return tr_list;
    }

    write_pop(input_dict: Map<string, any>, startdepths = 0): string {
        let text = "";
        let depths = startdepths;

        for (const key of input_dict.keys()) {
            const value = input_dict.get(key);

            if (Array.isArray(value)) {
                for (const v of value) {
                    if (v instanceof Map) {
                        text += "\t".repeat(depths) + key + "\n" + "\t".repeat(depths) + "{\n";
                        depths++;
                        text += this.write_pop(v, depths);
                        depths--;
                        text += "\n" + "\t".repeat(depths) + "}\n";
                    }

                    if (typeof v === "string") {
                        text += "\t".repeat(depths) + key + " " + v + "\n";
                    }
                }
            } else if (typeof value === "string") {

                text += "\t".repeat(depths) + key + " " + value + "\n";

            } else if (value instanceof Map) {
                text += "\t".repeat(depths) + key + "\n" + "\t".repeat(depths) + "{\n";
                depths++;
                text += this.write_pop(value, depths);
                depths--;
                text += "\n" + "\t".repeat(depths) + "}\n";
            }
        }

        return text;
    }

    wavesToMap(){
        let newar : Array<Map<string,any>> = []
        this.waves.forEach((w)=>{
            newar.push(w.getPopFormat())
        })
        this.pop_dict.get("WaveSchedule").set("Wave", newar)
    }

    mapToWaves(){
        const waves = this.pop_dict.get("WaveSchedule").get("Wave")
        if(waves == undefined){return []}
        waves.forEach(wmap => {
            const wi = new WaveInfo(wmap)
            this.waves.push(wi)
        });
        return this.waves
    }

    writePopToData(): string {
        return this.write_pop(this.pop_dict, 0)
    }
    async getTemplateArray(): Promise<Array<Template>> {
        this.templateLoader.addTemplate(this.pop_dict.get("WaveSchedule").get("Templates"));
        let templateImports: Array<string> = this.pop_dict.get("#base")
        console.log("Importing templates from: ", templateImports)
        if (Array.isArray(templateImports)) {
            for (const f of templateImports) {
                console.log(`Opening import ${f}`)
                let ta: Array<Template>;
                let result = await this.openImportFile(f)
                ta = result;
                this.templateLoader.appendTemplate(ta);
            }
        }
        return this.templateLoader.getTemplateArray();
    }

    async openImportFile(f: string): Promise<Array<Template>> {
        try {
            const response = await fetch(`pop/${f}`);
            if (response.ok) {
                const fileContent: string = await response.text();
                let p = new PopParser()
                p.giveRawData(fileContent)
                return p.getTemplateArray()
            } else {
                console.error('Failed to open file:', response.status, response.statusText);
                return [];
            }
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    }
}
