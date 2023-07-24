import { Template } from "./templateLoader";
import type { WaveInfo } from "./waveinfo";
export class WaveSpawn {
    public wave: WaveInfo;

    protected tank : boolean = false;
    protected bots = new Array<Template>()
    protected customAttributes = new Map<string, any>()
    protected id: string;


    // These keyvalues are stored for fast access
    protected name: string = "" //Name
    protected where: string = "" // Where
    protected totalcurrency: number = 0 //TotalCurrency
    //If not randomchoice and multiple bots, it is squad
    protected randomchoice: boolean;
    protected support: boolean = false //Support
    protected totalcount: number = 1 //TotalCount
    protected maxactive: number = 1 //MaxActive
    protected spawncount: number = 1 //SpawnCount
    protected perbot : number = 1

    protected keylist : Array<string> = ["Name", "Where", "TotalCurrency", "Support", "TotalCount", "MaxActive", "SpawnCount", "TFBot", "Squad", "RandomChoice", "Tank"]
    
    //Other keyvalues are stored here:
    protected extraAttributes : Map<string,any> = new Map<string, any>();

    constructor(wave: WaveInfo, tfbot?: Template, wavespawnmap?: Map<string, any>) {
        this.id = Date.now().toString(36) + Math.random().toString(36).substring(2);
        this.wave = wave;
        
        if (wavespawnmap != undefined) {
            //When reading wavespawn from pop file
            console.log("Processing ", wavespawnmap)
            //this.where = wavespawnmap.get("Where")
            
            this.name = this.readOrDefault(wavespawnmap, "Name", "")
            this.where = this.readOrDefault(wavespawnmap,"Where","")
            this.totalcurrency = this.readOrDefault(wavespawnmap, "TotalCurrency", 0)
            this.totalcount = this.readOrDefault(wavespawnmap,"TotalCount",1)
            this.maxactive = this.readOrDefault(wavespawnmap, "MaxActive", 1)
            this.spawncount = this.readOrDefault(wavespawnmap, "SpawnCount", 1)

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
                        this.bots.push(new Template("", botmap))
                    })
                    this.perbot = this.totalcount / group.length
                } else {
                    // Single Bot
                    this.bots.push(new Template("", group))
                    this.perbot = this.totalcount 
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
                        this.bots.push(new Template("", botmap))
                    })
                    
                } else {
                    // Single Bot
                    this.bots.push(new Template("", group))
                }
                this.perbot = this.totalcount 
                this.randomchoice = true
            } else {
                // Single Bot
                const botmap = wavespawnmap.get("TFBot")
                const tankmap = wavespawnmap.get("Tank")
                let map;
                if (botmap != undefined && tankmap == undefined) {
                    map = botmap
                } else if (botmap == undefined && tankmap != undefined){
                    map = tankmap
                    this.tank = true
                } else {
                    throw new Error("Tank and TFBot in same wavespawn and are not grouped to squad or randomchoice")
                }
                this.bots.push(new Template("", map))
                this.perbot = this.totalcount
            }
            const sup = wavespawnmap.get("Support")
            if(sup === "1"){
                this.support = true
            }
            for (const [name, value] of wavespawnmap.entries()) {
                if(!this.keylist.includes(name)){
                    this.extraAttributes.set(name, value)
                }
            }
        } else {
            // When creating a new wavespawn with template
            if (tfbot != undefined) { 
                this.bots.push(tfbot); 
                console.log(`Creating new Wavespawn with ${tfbot}`)
            } else {
                throw new Error("Error: New Wavespawn created without template")
            }
            this.name = tfbot.getName();

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
        popFormat.set("Name", this.name.toString());
        
        popFormat.set("TotalCurrency", this.totalcurrency.toString());
        popFormat.set("TotalCount", this.totalcount.toString());
        popFormat.set("MaxActive", this.maxactive.toString());
        popFormat.set("SpawnCount", this.spawncount.toString());
        if(this.support){
            popFormat.set("Support", "1")
        }
        

        if (this.tank == true){
            popFormat.set("Tank",this.bots[0].getdata()[0])
        } else if (this.bots.length > 1) {
            popFormat.set("Where", this.where.toString());
            let squadmap : Map<string, any> = new Map<string, any>()
            let ar : Array<Map<string, any>> = []
            this.bots.forEach((bot)=>{
                let arr = bot.getdata()
                ar.push(arr[0])
            })
            squadmap.set("TFBot", ar)
            popFormat.set("Squad", squadmap);
        } else if (this.bots.length == 1) {
            popFormat.set("Where", this.where.toString());
            popFormat.set("TFBot", this.bots[0].getdata()[0]);
        }
        for (const [name, value] of this.extraAttributes.entries()) {
            popFormat.set(name, value)
        }
        return popFormat;
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

    getCustomAttributes(): Map<string, any> {
        return this.customAttributes;
    }

    getName(): string {
        return this.name;
    }

    getWhere(): string {
        return this.where;
    }

    getTotalCurrency(): number {
        return this.totalcurrency;
    }

    getTotalCount(): number {
        return this.totalcount;
    }

    getMaxActive(): number {
        return this.maxactive;
    }

    getSpawnCount(): number {
        return this.spawncount;
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
        return this.support
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

    getCustomAttributes(): Map<string, any> {
        return this.customAttributes;
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