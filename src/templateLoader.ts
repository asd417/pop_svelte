import { VMTLoader } from "./vmtloader.js";
export class Template {
    private name: string;
    public templateOrigin: string;
    public classNum: number;
    public classIcon: string;
    public alwaysCrit: boolean = false
    public isGiant: boolean = false
    private isGatebot: boolean = false
    private defaultTemplate: Map<string, any> = new Map<string, any>();
    private RevertGateBotsBehaviorTemplate: Map<string, any> = new Map<string, any>();

    public extraAttributes: Map<string, any> = new Map<string, any>();

    constructor(name, dict: Map<string, any>) {
        this.name = name;
        this.templateOrigin = "";
        const isMap = dict instanceof Map;
        if (!isMap) { return }
        //console.log(dict)
        //console.log(dict.get("EventChangeAttributes"))
        //Check Gatebot
        //console.log("Template: ", dict.get("Template"))
        if (dict.get("EventChangeAttributes") != undefined) {
            //Is gatebot
            for (const [name, value] of dict.entries()) {
                if (name !== "EventChangeAttributes") {
                    this.defaultTemplate.set(name, value)
                    this.RevertGateBotsBehaviorTemplate.set(name, value)
                }
            }
            this.isGatebot = true;
            this.defaultTemplate = dict.get("EventChangeAttributes").get("Default");
            this.RevertGateBotsBehaviorTemplate = dict.get("EventChangeAttributes").get("RevertGateBotsBehavior");

            // Place the common attributes into both
            for (const [name, value] of dict.entries()) {
                if (name !== "EventChangeAttributes") {
                    this.defaultTemplate.set(name, value)
                    this.RevertGateBotsBehaviorTemplate.set(name, value)
                }
            }
        }
        else if (dict.get("Template") != undefined) {
            this.templateOrigin = dict.get("Template")
            console.log(
                "Setting templateorigin as", this.templateOrigin
            )
            for (const [name, value] of dict.entries()) {
                if (name != "Template") {
                    this.extraAttributes.set(name, value)
                }
            }
            return
        }
        else {
            this.defaultTemplate = dict;
        }

        if (this.templateOrigin === "") {
            //Store Class Icon
            let bot_class: string;
            bot_class = this.defaultTemplate.get("Class");
            if (bot_class === "demoman" || bot_class === "Demoman") { bot_class = "Demo" }
            if (bot_class === "heavyweapons" || bot_class === "Heavyweapons") { bot_class = "Heavy" }
            if (typeof (this.defaultTemplate.get("ClassIcon")) == "string") {
                this.classIcon = this.defaultTemplate.get("ClassIcon");
            }
            else {
                this.classIcon = bot_class;
            }
            if (this.classIcon.endsWith("_giant")) {
                this.classIcon = this.classIcon.slice(0, -6);

            }
            this.classIcon = this.classIcon.toLowerCase()
            const v_loader = new VMTLoader()
            v_loader.getBaseTexture(this.classIcon).then(result => this.classIcon = result)
            //Store classNum
            switch (bot_class.toLowerCase()) {
                case "scout":
                    this.classNum = 0;
                    break;
                case "soldier":
                    this.classNum = 1;
                    break;
                case "pyro":
                    this.classNum = 2;
                    break;
                case "demo":
                    this.classNum = 3;
                    break;
                case "heavy":
                    this.classNum = 4;
                    break;
                case "engineer":
                    this.classNum = 5;
                    break;
                case "sniper":
                    this.classNum = 6;
                    break;
                case "medic":
                    this.classNum = 7;
                    break;
                case "spy":
                    this.classNum = 8;
                    break;
            }
            //console.log(bot_class, this.classNum);

            //Store AlwaysCrit
            let attributes = this.defaultTemplate.get("Attributes");
            //console.log("ATTRIBUTE: ", attributes)
            if (typeof (attributes) == "string") {
                if (attributes === "AlwaysCrit") { this.alwaysCrit = true; }
                if (attributes === "MiniBoss") { this.isGiant = true; }
            }
            else if (Array.isArray(attributes)) {
                attributes.forEach((att) => {
                    if (att === "MiniBoss") { this.isGiant = true; }
                    if (att === "AlwaysCrit") { this.alwaysCrit = true; }
                });
            }
        }

    }
    getdata(): [Map<string, any>, string] {
        if (this.isGatebot) {

            let rr_dict: Map<string, any> = new Map<string, any>();

            let d = new Map(this.defaultTemplate);
            let e = new Map(this.RevertGateBotsBehaviorTemplate);

            let commondict: Map<string, any> = new Map<string, any>();
            for (const [namedefault, valuedefault] of this.defaultTemplate.entries()) {
                let valuechange = this.RevertGateBotsBehaviorTemplate.get(namedefault)
                if (valuedefault === valuechange) {
                    commondict.set(namedefault, valuedefault)
                    d.delete(namedefault);
                    e.delete(namedefault);
                }
            }
            rr_dict.set("Default", d);
            rr_dict.set("RevertGateBotsBehavior", e);
            let r_dict: Map<string, any> = new Map<string, any>();
            r_dict.set("EventChangeAttributes", rr_dict);
            for (const [name, value] of commondict.entries()) {
                r_dict.set(name, value)
            }
            return [r_dict, this.name];
        }
        return [this.defaultTemplate, this.name];
    }
    getName(): string {
        return this.name;
    }
}

export class TemplateLoader {
    public templates: Array<Template> = new Array<Template>();
    constructor() {

    }
    addTemplate(dict: Map<string, any>) {
        for (const [name, value] of dict.entries()) {
            let template = new Template(name, value)
            console.log("Creating Template called ", name, "as", template.getdata())
            this.templates.push(template)
        }
    }
    getTemplateArray(): Array<Template> {
        return this.templates;
    }
    appendTemplate(a: Array<Template>) {
        this.templates = this.templates.concat(a);
    }
    findTemplate(name:string): Template {
        //console.log("Searching for ", name)
        let found = undefined
        this.templates.forEach((t)=>{
            //console.log(t.getName(), "<>", name, "<>",(t.getName() === name))
            if(t.getName() === name){
                found = t
            }
        })
        //console.log("Could not find template: ", name)
        return found
    }
}
