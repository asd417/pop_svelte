import { VMTLoader } from "./vmtloader.js";
export class Template {
    public name: string = ""
    public templateOrigin: string = ""
    public classNum: number;
    public classIcon: string;
    public alwaysCrit: boolean = false
    public isTank: boolean = false
    public isGiant: boolean = false
    public hasEventChangeAttribute: boolean = false
    private defaultTemplate: Map<string, any> = new Map<string, any>();
    //private RevertGateBotsBehaviorTemplate: Map<string, any> = new Map<string, any>();

    public extraAttributes: Map<string, any> = new Map<string, any>();
    private ECAEntryNames: Array<string> = []
    constructor(dict: Map<string, any>) {
        this.readFromMap(dict)
    }

    readFromMap(dict: Map<string,any>){
        //console.info("Processing Template Map:", dict)
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
            this.setUpECABot(dict)
            type ObjectKey = keyof typeof Template;
            const keyname = this.ECAEntryNames[0] as ObjectKey;
            this.setUpBotVariables(this[keyname])
            this.setUpBotVariables(this.extraAttributes)
        //} else if (dict.get("Template") != undefined) {
        } else if (this.readKey(dict,"Template") != undefined) {
            this.setUpTemplateBot(dict)
            return
        } else {
            this.defaultTemplate = dict;
            this.setUpBotVariables(this.defaultTemplate)
        }
    }

    private setUpTemplateBot(dict: Map<string,any>){
        this.templateOrigin = this.readKey(dict,"Template")
        //console.log("Setting templateorigin as", this.templateOrigin)
        for (const [name, value] of dict.entries()) {
            if (name != "Template") {
                this.extraAttributes.set(name, value)
            }
        }
    }

    private setUpECABot(dict: Map<string,any>){
        //ECA can have multiple blocks
        //block named Default is the default block.
        //If not found, use first named block
        //blocks can be named as anything
        //has EventChangeAttributes

        //Save all the attributes outside the ECA tree in extraAttributes
        for (const [name, value] of dict.entries()) {
            if (name !== "EventChangeAttributes") {
                this.extraAttributes.set(name, value)
            }
        }
        this.hasEventChangeAttribute = true;
        
        type ObjectKey = keyof typeof Template;
        let defaultFound_i = 0
        let ecaEntryMap = this.readKey(dict,"EventChangeAttributes") as Map<string, any>

        for (const [name, value] of ecaEntryMap.entries()) {
            this.ECAEntryNames.push(name)
            const keyname = name as ObjectKey;
            this[keyname] = value

            console.log(name, value)
            if(name == "Default") {
                defaultFound_i = this.ECAEntryNames.length - 1
            }
            //this.defaultTemplate.set(name, value)
            //this.RevertGateBotsBehaviorTemplate.set(name, value)
        }
        if(defaultFound_i != 0) { 
            const d_name = this.ECAEntryNames[defaultFound_i]
            this.ECAEntryNames.splice(defaultFound_i,1)
            this.ECAEntryNames = [d_name].concat(this.ECAEntryNames)
            
        } 
        console.log(this)
    }

    private setUpBotVariables(checkmap : Map<string,any>){
        //Store Class Icon
        //bot_class = this.defaultTemplate.get("Class");
        let bot_class: string = this.readKey(checkmap, "Class")
        //console.log("bot_class is ", bot_class)
        if (bot_class === "demoman" || bot_class === "Demoman") { bot_class = "Demo" }
        if (bot_class === "heavyweapons" || bot_class === "Heavyweapons") { bot_class = "Heavy" }

        if (typeof (this.readKey(checkmap,"ClassIcon")) == "string") {
            this.classIcon = this.readKey(checkmap,"ClassIcon");
        } else if (typeof (bot_class) == "string"){
            this.classIcon = bot_class.toLowerCase();
        }

        if ((typeof (bot_class) == "string") && (typeof (this.classIcon) == "string")) {
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
        }
        //Store AlwaysCrit
        //let attributes = this.defaultTemplate.get("Attributes");
        const attributes = this.readKey(checkmap, "Attributes")
        //console.log("ATTRIBUTE: ", attributes)
        this.isGiant = false;
        this.alwaysCrit = false;
        if (typeof (attributes) == "string") {
            if (attributes === "AlwaysCrit") { this.alwaysCrit = true;}
            else if (attributes === "MiniBoss") { this.isGiant = true;}
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
        } else if (this.hasEventChangeAttribute) {
            const rr_dict: Map<string, any> = new Map<string, any>();
            type ObjectKey = keyof typeof Template;
            for (const [i, entryName] of this.ECAEntryNames.entries()) {
                const keyname = entryName as ObjectKey;
                rr_dict.set(entryName, this[keyname])
            }
            const r_dict: Map<string, any> = new Map<string, any>();
            r_dict.set("EventChangeAttributes", rr_dict);
            for (const [name, value] of this.extraAttributes.entries()) {
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
    updateKV(key: string, value: any){
        if(this.templateOrigin != ""){
            this.extraAttributes.set(key, value)
            console.log("setUpBotVariables with extraAttributes", value)
        } else {
            console.log("setUpBotVariables with defaultTemplate")
            this.defaultTemplate.set(key, value)
            this.setUpBotVariables(this.defaultTemplate)
        }
    }
    removeKV(key: string){
        if(this.templateOrigin != ""){
            this.extraAttributes.delete(key)
        } else {
            this.defaultTemplate.delete(key)
            this.setUpBotVariables(this.defaultTemplate)
        }
    }
}

export class TemplateLoader {
    public templates: Array<Template> = new Array<Template>();
    public embededTemplates : Array<Template> = new Array<Template>();
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

    //templates in embededTemplates will be written into the pop file on export
    addEmbedTemplate(dict: Map<string, any>) {
        for (const [name, value] of dict.entries()) {
            let template = new Template(value)
            template.setName(name)
            this.embededTemplates.push(template)
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
        this.embededTemplates.forEach((t)=>{
            //console.log(t.getName(), "<>", name, "<>",(t.getName() === name))
            if(t.getName() === name){
                found = t
            }
        })
        //console.log("Could not find template: ", name)
        return found
    }
}
