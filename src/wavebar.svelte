<script lang="ts">
    import type { WaveInfo } from "./waveinfo";
    import { Template } from "./templateLoader";
    import { WaveSpawn } from "./wavespawn";
    import Wavespawnicon from "./wavespawnicon.svelte";
    import { createEventDispatcher } from "svelte";
    import { STATICACCESS } from "./App.svelte";
    import { insert } from "svelte/internal";

    export let waveinfo: WaveInfo;

    let wavespawns = waveinfo.getWaveSpawnList();
    //List of buttons generated
    let wavespawniconlist = [];
    let wavespawnlist: Array<WaveSpawn> = [];
    let waveMoney : number = 0;

    const dispatch = createEventDispatcher();

    function handleDrop(event: DragEvent) {
        //When Something is Dragged ONTO THIS wavebar
        event.preventDefault();

        if (event.dataTransfer.types.includes("templatename")) {
            console.log("Dropping Template");
            //Dropping template in wavebar
            const temname = event.dataTransfer.getData("templatename");
            waveinfo.addTemplateAsWaveSpawn(STATICACCESS.findTemplate(temname));

            //console.log("Wavespawnlist:", wavespawnlist);
        } else if (event.dataTransfer.types.includes("wavespawnid")) {
            //Dropping wavespawn in wavebar
            console.log("Dropping Wavespawn");
            const wavespawnid = event.dataTransfer.getData("wavespawnid");
            let targetwavespawn: WaveSpawn;
            let samebar = false;
            let removedfrom = 0;
            if (waveinfo.getID() == event.dataTransfer.getData("waveid")) {
                console.log("Drag Start and Drag End Same");
                //console.log(wavespawniconlist)
                samebar = true;
            }

            //Remove the existing wavespawn
            STATICACCESS.parser.waves.forEach((w) => {
                if (w.getID() == event.dataTransfer.getData("waveid")) {
                    w.wavespawns.forEach((ws, i) => {
                        if (ws.getID() == wavespawnid) {
                            w.wavespawns.splice(i, 1);
                            removedfrom = i;
                            console.log(
                                "Removed wavespawn. result:",
                                w.wavespawns
                            );
                            targetwavespawn = ws;
                        }
                    });
                    //w.removewavespawn(event.dataTransfer.getData("wavespawnid"))
                }
            });

            //wavespawns = waveinfo.getWaveSpawnList()
            //the placed wavespawn will always be the last element because the existing one was removed and this was appended afterwards
            //the placed wavespawn needs to be sorted inside the wavebar with event.pageX
            //compare event.pageX with x positions of the buttons in wavespawniconlist
            let first = false;
            let firstpos = { x: 0, w: 0 };
            let insertpos = -1;
            console.log(wavespawniconlist);
            wavespawniconlist.forEach((button, i) => {
                let position = { x: 0, w: 0 };
                const rect = button.getBoundingClientRect();
                position = { x: rect.left, w: rect.right - rect.left };
                if (event.pageX < Math.floor(position.x + position.w / 2)) {
                    if (!first) {
                        first = true;
                        firstpos = position;
                        insertpos = i;
                    }
                    //Reached final button but could not insert
                }
            });
            console.log("xpos:", firstpos.x, event.pageX);

            //Add to the wavebar
            if (insertpos != -1) {
                if (samebar && removedfrom < insertpos) {
                    insertpos -= 1;
                }
                waveinfo.addWaveSpawnAtPos(targetwavespawn, insertpos);
            } else {
                waveinfo.addWaveSpawn(targetwavespawn);
            }
        } else {
            console.log("Drop rejected!");
            // Handle the logic for a rejected drop
        }
        dispatch("updateWaveBars");
    }

    function handleDragOver(event) {
        event.preventDefault();
    }
    function removethis() {
        const id = waveinfo.getID();
        dispatch("removeWave", { id });
    }

    function newWaveSpawnClicked() {
        const t :Template = new Template(undefined)
        console.log(`Created: ${t}`)
        const new_wavespawn = new WaveSpawn(waveinfo, t)
        waveinfo.addWaveSpawn(new_wavespawn);
        dispatch("updateWaveBars");
    }

    function wavespawnSelectEventBubble(event) {
        const ws = event.detail.wavespawn
        dispatch("wavespawnSelectEvent",{wavespawn : ws});
    }

    $: {
        //console.log("Wavebar Update Called")
        wavespawns = waveinfo.getWaveSpawnList();
        waveMoney = 0
        wavespawns.forEach((ws) => {
            waveMoney = waveMoney + ws.getTotalCurrency() as number
        })

        wavespawniconlist.forEach((ws, i) => {
            if (ws == null) {
                wavespawniconlist.splice(i, 1);
            }
        });
    }
</script>

<div
    class="wavebar droppableDiv"
    on:drop={handleDrop}
    on:dragover={handleDragOver}
>
    <button class="close" on:click={removethis}> Remove Wave</button>
    <p>Total Currency: {waveMoney} + 100</p>
    {#each wavespawns as entry, index}
        <Wavespawnicon
            wavespawn={entry}
            bind:waveelement={wavespawniconlist[index]}
            on:wavespawnSelectEvent={wavespawnSelectEventBubble}
        />
    {/each}
    <button class="wavespawn" on:click={newWaveSpawnClicked}>
        <div class="wavespawn_bots">
            <div class="Icon cc iconContainer">
                <img src="icons/plus.png" alt="plus.png" draggable="false" />
            </div>
        </div>
    </button>
</div>

<style>
    .close {
        position: absolute;
        left: 3px;
        top: 3px;
        width: 11px;
        height: 10px;
        opacity: 0.5;
        border: 0px;
        background-color: transparent;
        z-index: 2;
    }
    .close:hover {
        opacity: 1;
    }
    .close:before,
    .close:after {
        position: absolute;
        left: 5px;
        top: 2px;
        content: " ";
        height: 10px;
        width: 2px;
        background-color: #c7c7c7;
    }
    .close:before {
        transform: rotate(45deg);
    }
    .close:after {
        transform: rotate(-45deg);
    }
    .close:active {
        background-color: transparent;
    }

    .wavebar {
        position: relative;
        overflow: auto;
        display: flex;
        flex-direction: row;
        white-space: nowrap;
        min-height: 80px;
        min-width: 80px;
        max-width: 100%;
        border: 1px solid #2d2d2d;
    }

    .wavespawn {
        background-color: #303030;
        border-radius: 10px;
    }

    .wavespawn_bots {
        cursor: pointer;
        width: auto;

        min-height: 85px;
        display: flex;
        flex-direction: row;

        align-items: center;
    }

    .cc {
        position: relative;
    }
</style>
