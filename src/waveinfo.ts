import { WaveSpawn } from './wavespawn'
import type { Template } from './templateLoader'
export class WaveInfo {

    public wavespawns: Array<WaveSpawn> = []
    protected id: string;

    constructor(wavemap?: Map<string, any>) {
        this.id = Date.now().toString(36) + Math.random().toString(36).substring(2);
        if (wavemap != undefined) {
            const wavespawnlist = wavemap.get("WaveSpawn")
            if (Array.isArray(wavespawnlist)) {
                wavespawnlist.forEach(wavespawnmap => {
                    this.wavespawns.push(new WaveSpawn(this, undefined, wavespawnmap))
                })
            }
            else {
                this.wavespawns.push(new WaveSpawn(this, undefined, wavespawnlist))
            }
        }
    }
    addWaveSpawn(ws: WaveSpawn) {
        this.wavespawns.push(ws)
        ws.wave = this
    }
    addWaveSpawnAtPos(ws: WaveSpawn, i: number) {
        this.wavespawns.splice(i, 0, ws)
        ws.wave = this
    }
    addTemplateAsWaveSpawn(tem: Template): WaveSpawn {
        let ws = new WaveSpawn(this, tem)
        this.addWaveSpawn(ws)
        return ws
    }
    getWaveSpawnList(): Array<WaveSpawn> {
        return this.wavespawns
    }
    removewavespawn(wavespawnid: string) {
        this.wavespawns.forEach((ws, i) => {
            if (ws.getID() == wavespawnid) {
                this.wavespawns.splice(i, 1);
                console.log("Removed wavespawn. result:", this.wavespawns)

            }
        });
    }
    getID() {
        return this.id
    }
    getPopFormat() {
        const popFormat = new Map<string, any>();
        let wsar: Array<Map<string, any>> = []
        this.wavespawns.forEach((ws) => {
            wsar.push(ws.getPopFormat())
        })
        popFormat.set("Checkpoint", "Yes")
        popFormat.set("WaveSpawn", wsar)
        return popFormat
    }
}