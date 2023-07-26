import { VMTLoader } from "./vmtloader.js";
export class Template {
    public name: string = ""
    public templateOrigin: string = ""
    public classNum: number;
    public classIcon: string;
    public alwaysCrit: boolean = false
    public isTank: boolean = false
    public isGiant: boolean = false
    public isGatebot: boolean = false
    private defaultTemplate: Map<string, any> = new Map<string, any>();
    private RevertGateBotsBehaviorTemplate: Map<string, any> = new Map<string, any>();

    public extraAttributes: Map<string, any> = new Map<string, any>();

    constructor(dict: Map<string, any>) {
        console.info("Processing Template Map:", dict)
        const isMap = dict instanceof Map;
        // if (!isMap) { return }
        if (dict == undefined) {
            // Default values
            this.classNum = 0; // Scout
            this.classIcon = "scout";
            this.defaultTemplate.set("Class", "Scout")
            return this
        }

        // extraAttributes is used to store attributes when 
        // Tank Wavespawn
        //if (dict.get("StartingPathTrackNode") != undefined) {
        if(this.readKey(dict,"StartingPathTrackNode") != undefined){
            this.setUpTank(dict)
        //} else if (dict.get("EventChangeAttributes") != undefined) {
        } else if (this.readKey(dict,"EventChangeAttributes") != undefined) {    
            this.setUpGateBot(dict)
        //} else if (dict.get("Template") != undefined) {
        } else if (this.readKey(dict,"Template") != undefined) {
            this.templateOrigin = this.readKey(dict,"Template")
            //console.log("Setting templateorigin as", this.templateOrigin)
            for (const [name, value] of dict.entries()) {
                if (name != "Template") {
                    this.extraAttributes.set(name, value)
                }
            }
            return
        } else {
            this.defaultTemplate = dict;
        }

        if (dict != undefined && this.templateOrigin === "" && !this.isTank) {
            //console.log(this.defaultTemplate, this.RevertGateBotsBehaviorTemplate)
            this.setUpBotVariables()
        }

    }

    private setUpGateBot(dict: Map<string,any>){
        //Is gatebot
        for (const [name, value] of dict.entries()) {
            if (name !== "EventChangeAttributes") {
                this.defaultTemplate.set(name, value)
                this.RevertGateBotsBehaviorTemplate.set(name, value)
            }
        }
        this.isGatebot = true;
        //this.defaultTemplate = dict.get("EventChangeAttributes").get("Default");
        let ECA = this.readKey(dict, "EventChangeAttributes")
        //console.log("ECA", ECA)
        this.defaultTemplate = this.readKey(ECA, "Default")
        //this.RevertGateBotsBehaviorTemplate = dict.get("EventChangeAttributes").get("RevertGateBotsBehavior");
        this.RevertGateBotsBehaviorTemplate = this.readKey(ECA, "RevertGateBotsBehavior")
        // Place the common attributes into both
        for (const [name, value] of dict.entries()) {
            if (name !== "EventChangeAttributes") {
                this.defaultTemplate.set(name, value)
                this.RevertGateBotsBehaviorTemplate.set(name, value)
            }
        }
    }

    private setUpBotVariables(){
        //Store Class Icon
        //bot_class = this.defaultTemplate.get("Class");
        let bot_class: string = this.readKey(this.defaultTemplate, "Class")
        //console.log("bot_class is ", bot_class)
        if (bot_class === "demoman" || bot_class === "Demoman") { bot_class = "Demo" }
        if (bot_class === "heavyweapons" || bot_class === "Heavyweapons") { bot_class = "Heavy" }

        //if (typeof (this.defaultTemplate.get("ClassIcon")) == "string") {
        if (typeof (this.readKey(this.defaultTemplate,"ClassIcon")) == "string") {
            this.classIcon = this.readKey(this.defaultTemplate,"ClassIcon");
        }
        else {
            this.classIcon = bot_class.toLowerCase();
        }

        //console.log("Class Icon?: ", this.classIcon)
        if (this.classIcon.endsWith("_giant")) {
            this.classIcon = this.classIcon.slice(0, -6);

        }
        //this.classIcon = this.classIcon.toLowerCase()
        const v_loader = new VMTLoader()
        try{
            v_loader.getBaseTexture(this.classIcon).then((result) => {
                if(result == undefined)
                {
                    console.error(this.classIcon, "VMT file exists but could not read basetexture")
                }
                this.classIcon = result
            }) 
        } catch (error){
            console.error("Error Loading VMT file for ", this.classIcon, ": file does not exist")
        }

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
        //let attributes = this.defaultTemplate.get("Attributes");
        let attributes = this.readKey(this.defaultTemplate, "Attributes")
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

    private setUpTank(dict: Map<string,any>){
        this.isTank = true
        this.isGiant = true
        //if (typeof (this.defaultTemplate.get("ClassIcon")) == "string") {
        if (typeof (this.readKey(this.defaultTemplate,"ClassIcon")) == "string") {
            this.classIcon = this.defaultTemplate.get("ClassIcon");
        } else {
            this.classIcon = "tank"
        }
        this.classNum = 9
        for (const [name, value] of dict.entries()) {
            this.extraAttributes.set(name, value)
        }
    }

    setName(s: string) {
        this.name = s
    } 

    getdata(): [Map<string, any>, string] {
        if(this.isTank){
            return [this.extraAttributes, this.name]
        } else if(this.templateOrigin != ""){
            let rr_dict: Map<string, any> = new Map<string, any>();
            rr_dict.set("Template", this.templateOrigin)
            for (const [name, value] of this.extraAttributes.entries()) {
                if (name != "Template") {
                    rr_dict.set(name,value)
                }
            }
            return [rr_dict, this.name]
        } else if (this.isGatebot) {
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
    readKey(map: Map<string, any>, f:string) {
        let r = map.get(f)
        if(r == undefined){
            r = map.get(f.toLowerCase()) 
        }
        return r
    }
}

export class TemplateLoader {
    public templates: Array<Template> = new Array<Template>();
    constructor() {

    }
    addTemplate(dict: Map<string, any>) {
        //console.log(dict)
        for (const [name, value] of dict.entries()) {
            let template = new Template(value)
            template.setName(name)
            console.info("Creating Template called ", name, "as", template.getdata())
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
