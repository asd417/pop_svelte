import { Template } from "./templateLoader";
import type { WaveInfo } from "./waveinfo";
export class WaveSpawn {
    public wave: WaveInfo;

    protected tank : boolean = false;
    protected bots = new Array<Template>()
    protected id: string;


    // These keyvalues are stored for fast access
    protected Name: string = "" //Name
    protected Where = "" // Where Can be string or Array
    protected TotalCurrency: number = 0 //TotalCurrency
    //If not randomchoice and multiple bots, it is squad
    protected randomchoice: boolean = false
    protected Support: boolean = false //Support
    protected TotalCount: number = 1 //TotalCount
    protected MaxActive: number = 1 //MaxActive
    protected SpawnCount: number = 1 //SpawnCount
    protected perbot : number = 1

    protected keylist : Array<string> = ["Name", "Where", "TotalCurrency", "Support", "TotalCount", "MaxActive", "SpawnCount", "TFBot", "Squad", "RandomChoice", "Tank"]
    protected default = {Name : "", 
                        Where : "", 
                        TotalCurrency : 0, 
                        randomchoice : false,
                        Support : false,
                        TotalCount : 1,
                        MaxActive : 1,
                        SpawnCount : 1}

    //Other keyvalues are stored here:
    protected extraAttributes : Map<string,any> = new Map<string, any>();

    constructor(wave: WaveInfo, tfbot?: Template, wavespawnmap?: Map<string, any>) {
        this.id = Date.now().toString(36) + Math.random().toString(36).substring(2);
        this.wave = wave;
        
        if (wavespawnmap != undefined) {
            this.processWaveMap(wavespawnmap)
        } else {
            // When creating a new wavespawn with template
            if (tfbot != undefined) { 
                this.bots.push(tfbot); 
                console.log(`Creating new Wavespawn with ${tfbot}`)
            } else {
                //throw new Error("Error: New Wavespawn created without template")
            }
            //this.Name = tfbot.getName();

        }
    }

    processWaveMap(wavespawnmap: Map<string,any>){
        //When reading wavespawn from pop file
        console.log("Processing ", wavespawnmap)
        //this.where = wavespawnmap.get("Where")
        
        this.Name = this.readOrDefault(wavespawnmap, "Name", "")
        this.Where = this.readOrDefault(wavespawnmap,"Where","")
        this.TotalCurrency = parseInt(this.readOrDefault(wavespawnmap, "TotalCurrency", 0))
        this.TotalCount = parseInt(this.readOrDefault(wavespawnmap,"TotalCount",1))
        this.MaxActive = parseInt(this.readOrDefault(wavespawnmap, "MaxActive", 1))
        this.SpawnCount = parseInt(this.readOrDefault(wavespawnmap, "SpawnCount", 1))

        this.bots = []

        const squadinfo = wavespawnmap.get("Squad")
        const randomchoiceinfo = wavespawnmap.get("RandomChoice")
        if (squadinfo != undefined) {
            // Squad 
            const bots = squadinfo.get("TFBot")
            const tanks = wavespawnmap.get("Tank")

            let group;
            if (bots != undefined && tanks == undefined) {
                group = bots
            } else if (bots == undefined && tanks != undefined){
                group = tanks
                this.tank = true
            } else {
                throw new Error("Tank and TFBot can not be in same squad")
            }
            
            if (Array.isArray(group)) {
                // Multiple Bots
                group.forEach(botmap => {
                    this.bots.push(new Template(botmap))
                })
                this.perbot = this.TotalCount / group.length
            } else {
                // Single Bot
                this.bots.push(new Template(group))
                this.perbot = this.TotalCount 
            }
            this.randomchoice = false
        } else if (randomchoiceinfo != undefined) {
            // RandomChoice
            const bots = randomchoiceinfo.get("TFBot")
            const tanks = randomchoiceinfo.get("Tank")

            let group;
            if (bots != undefined && tanks == undefined) {
                group = bots
            } else if (bots == undefined && tanks != undefined){
                group = tanks
                this.tank = true
            } else {
                throw new Error("Tank and TFBot can not be in same randomchoice")
            }

            if (Array.isArray(group)) {
                // Multiple Bots
                group.forEach(botmap => {
                    this.bots.push(new Template(botmap))
                })
                
            } else {
                // Single Bot
                this.bots.push(new Template(group))
            }
            this.perbot = this.TotalCount 
            this.randomchoice = true
        } else {
            // Single Bot
            const botmap = wavespawnmap.get("TFBot")
            const tankmap = wavespawnmap.get("Tank")
            const pointtemplate = wavespawnmap.get("PointTemplate")
            let map;
            if (botmap != undefined && tankmap == undefined) {
                map = botmap
                this.bots.push(new Template(map))
            } else if (botmap == undefined && tankmap != undefined){
                map = tankmap
                this.tank = true
                this.bots.push(new Template(map))
            } else if (botmap == undefined && tankmap == undefined){
                //Wavespawn has no bot or tank
                //Very likely uses Rafmod PointTemplate instead of spawning anything
                //throw new Error("Tank and TFBot in same wavespawn and are not grouped to squad or randomchoice")
            
            }
            this.perbot = this.TotalCount
        }
        const sup = wavespawnmap.get("Support")
        if(sup === "1"){
            this.Support = true
        }
        for (const [name, value] of wavespawnmap.entries()) {
            if(!this.keylist.includes(name)){
                this.extraAttributes.set(name, value)
            }
        }
    }
    updateKV(key, value) {
        if(this.keylist.includes(key)){
            type ObjectKey = keyof typeof WaveSpawn;

            const keyname = key as ObjectKey;
            
            if(Array.isArray(value)){
                this[keyname] = value
                console.log("Updating Wavespawn Keyvalue as Array: ", this)
                return
            }
            
            switch (typeof(this.default[key])){
                case "string":
                    this[keyname] = value.toString()
                    break;
                case "number":
                    this[keyname] = parseInt(value)
                    break;
            }

            console.log("Updating Wavespawn Keyvalue: ", this)
        } else { 
            this.extraAttributes.set(key, value)
            console.log("Updating Wavespawn Keyvalue in extra attribute", this)
        } 
    }
    
    removeKV(key: string){
        if(this.keylist.includes(key)){
            type ObjectKey = keyof typeof WaveSpawn;

            const keyname = key as ObjectKey;
            this[keyname] = this.default[key]
            
            console.log("Updating Wavespawn Keyvalue: ", this)
        } else { 
            this.extraAttributes.delete(key)
        }
    }

    readOrDefault(target: Map<string,any>, key, defaultValue){
        const r = target.get(key)
        if(r == undefined){
            return defaultValue
        }
        return r
    }
    
    getPopFormat(): Map<string, any> {
        const popFormat = new Map<string, any>();
        //popFormat.set("bots", this.bots);
        //popFormat.set("customAttributes", this.customAttributes);
        popFormat.set("Name", this.Name.toString());
        
        popFormat.set("TotalCurrency", this.TotalCurrency.toString());
        popFormat.set("TotalCount", this.TotalCount.toString());
        popFormat.set("MaxActive", this.MaxActive.toString());
        popFormat.set("SpawnCount", this.SpawnCount.toString());
        if(this.Support){
            popFormat.set("Support", "1")
        }
        
        if (this.tank == true){
            popFormat.set("Tank",this.bots[0].getdata()[0])
        } else if (this.bots.length > 1) {
            if(typeof(this.Where) == "string"){
                popFormat.set("Where", this.Where.toString());
            }
            else {
                popFormat.set("Where", this.Where);
            }
            
            let squadmap : Map<string, any> = new Map<string, any>()
            let ar : Array<Map<string, any>> = []
            this.bots.forEach((bot)=>{
                let arr = bot.getdata()
                ar.push(arr[0])
            })
            squadmap.set("TFBot", ar)
            popFormat.set("Squad", squadmap);
        } else if (this.bots.length == 1) {
            if(typeof(this.Where) == "string"){
                popFormat.set("Where", this.Where.toString());
            }
            else {
                popFormat.set("Where", this.Where);
            }
            popFormat.set("TFBot", this.bots[0].getdata()[0]);
        }
        for (const [name, value] of this.extraAttributes.entries()) {
            popFormat.set(name, value)
        }
        return popFormat;
    }

    //Add a known template bot to this wavespawn using Template key
    addTemplateAsBot(bot: Template) {
        let tem = new Map<string,any>()
        tem.set("Template", bot.getName())
        this.bots.push(new Template(tem))
        this.perbot = this.TotalCount / this.bots.length
    }

    writeTFBot(bot: Template): Map<string, any> {
        const dataarray = bot.getdata();
        if (bot.templateOrigin === "") {
            return dataarray[0];
        } else {
            const r_map = new Map<string, any>();
            r_map.set("Template", dataarray[1])
            for (let [key, value] of bot.extraAttributes) {
                r_map.set(key, value)
            }
            return r_map
        }
    }

    getID(): string {
        return this.id
    }

    getBots(): Template[] {
        return this.bots;
    }

    getBotAtIndex(i: number) : Template {
        return this.bots[i];
    }

    getName(): string {
        return this.Name;
    }

    getWhere(): string {
        return this.Where;
    }

    getTotalCurrency(): number {
        return this.TotalCurrency;
    }

    getTotalCount(): number {
        return this.TotalCount;
    }

    getMaxActive(): number {
        return this.MaxActive;
    }

    getSpawnCount(): number {
        return this.SpawnCount;
    }

    getPerBot(): number {
        return this.perbot;
    }

    isRandomChoice(): boolean {
        if(this.bots.length > 1 && this.randomchoice)
        {
            return true
        }
        return false
    }

    isSupport() : boolean {
        return this.Support
    }

    getWaveType(): string {
        if(this.bots.length > 1 && this.randomchoice)
        {
            return "Random Choice"
        } else if (this.bots.length > 1) {
            return "Squad"
        }
        return "TFBot"
    }
}

class Mission {
    protected objective: string = "Spy"
    protected where: string = "";
    protected cooldowntime: number = 30;
    protected initialcooldown: number = 60;
    protected beginatwave: number = 1;
    protected runforthismanywaves: number = 1;
    protected desiredcount: number = 1;
    protected bot: Template;
    protected customAttributes = new Map<string, any>()

    constructor(bot: Template) {
        this.bot = bot;
    }

    getPopMap(): Map<string, any> {
        const popFormat = new Map<string, any>();

        popFormat.set("Objective", this.objective.toString());
        popFormat.set("Where", this.where.toString());
        popFormat.set("CooldownTime", this.cooldowntime.toString());
        popFormat.set("InitialCooldown", this.initialcooldown.toString());
        popFormat.set("BeginAtWave", this.beginatwave.toString());
        popFormat.set("RunForThisManyWaves", this.runforthismanywaves.toString());
        popFormat.set("DesiredCount", this.desiredcount.toString());
        //popFormat.set("bot", this.bot);
        //popFormat.set("customAttributes", this.customAttributes);

        return popFormat;
    }

    getObjective(): string {
        return this.objective;
    }

    getWhere(): string {
        return this.where;
    }

    getCooldownTime(): number {
        return this.cooldowntime;
    }

    getInitialCooldown(): number {
        return this.initialcooldown;
    }

    getBeginAtWave(): number {
        return this.beginatwave;
    }

    getRunForThisManyWaves(): number {
        return this.runforthismanywaves;
    }

    getDesiredCount(): number {
        return this.desiredcount;
    }

    getBot(): Template {
        return this.bot;
    }
}