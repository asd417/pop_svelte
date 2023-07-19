import { Template } from "./templateLoader";
import type { WaveInfo } from "./waveinfo";
export class WaveSpawn {
    public wave: WaveInfo;

    protected tank : Template = null;
    protected bots = new Array<Template>()
    protected customAttributes = new Map<string, any>()
    protected id: string;
    protected name: string = ""
    protected where: string = ""
    protected totalcurrency: number = 0

    //If not randomchoice and multiple bots, it is squad
    protected randomchoice: boolean;

    protected totalcount: number = 1
    protected maxactive: number = 1
    protected spawncount: number = 1
    protected waitbeforestarting: number = 0
    protected waitbetweenspawns: number = 0

    constructor(wave: WaveInfo, tfbot?: Template, wavespawnmap?: Map<string, any>) {
        this.id = Date.now().toString(36) + Math.random().toString(36).substring(2);
        this.wave = wave;
        if (wavespawnmap != undefined) {
            console.log("Processing ", wavespawnmap)
            this.name = wavespawnmap.get("Name")
            //const tankinfo = wavespawnmap.get("Tank")
            //if (tankinfo != undefined) {
            //    this.tank = new Template("", tankinfo);
            //    return
            //}
            const squadinfo = wavespawnmap.get("Squad")
            const randomchoiceinfo = wavespawnmap.get("Randomchoice")
            if (squadinfo != undefined) {
                const bots = squadinfo.get("TFBot")
                if (Array.isArray(bots)) {
                    bots.forEach(botmap => {
                        this.bots.push(new Template("", botmap))
                    })
                } else {
                    this.bots.push(new Template("", bots))
                }
                this.randomchoice = false
            } else if (randomchoiceinfo != undefined) {
                const bots = randomchoiceinfo.get("TFBot")
                if (Array.isArray(bots)) {
                    bots.forEach(botmap => {
                        this.bots.push(new Template("", botmap))
                    })
                }
                this.randomchoice = true
            } else {
                const botmap = wavespawnmap.get("TFBot")
                this.bots.push(new Template("", botmap))
            }
        } else {
            this.bots.push(tfbot);
            this.name = tfbot.getName();

        }
    }

    getPopFormat(): Map<string, any> {
        const popFormat = new Map<string, any>();
        //popFormat.set("bots", this.bots);
        //popFormat.set("customAttributes", this.customAttributes);
        popFormat.set("Name", this.name.toString());
        popFormat.set("Where", this.where.toString());
        popFormat.set("TotalCurrency", this.totalcurrency.toString());
        popFormat.set("TotalCount", this.totalcount.toString());
        popFormat.set("MaxActive", this.maxactive.toString());
        popFormat.set("SpawnCount", this.spawncount.toString());
        popFormat.set("WaitBeforeStarting", this.waitbeforestarting.toString());
        popFormat.set("WaitBetweenSpawns", this.waitbetweenspawns.toString());
        if (this.tank != null){
            popFormat.set("Tank",this.tank)
        } else if (this.bots.length > 1) {
            let ar : Array<Map<string, any>> = []
            this.bots.forEach((bot)=>{
                let arr = bot.getdata()
                ar.push(arr[0])
            })
            popFormat.set("TFBot", ar);
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

    getWaitBeforeStarting(): number {
        return this.waitbeforestarting;
    }

    getWaitBetweenSpawns(): number {
        return this.waitbetweenspawns;
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