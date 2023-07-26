<script lang="ts">

    import type { WaveSpawn } from "./wavespawn";
    import Iconvisual from "./iconvisual.svelte";
    import Boticon from "./boticon.svelte";
    import Kvlineedit from "./kvlineedit.svelte";
    import { createEventDispatcher } from "svelte";
    import { STATICACCESS } from "./App.svelte";
    export let wavespawn : WaveSpawn
    let kvpairs : Array<Array<string>> = [];
    let newkey = ""

    const ignoreK = ["Squad", "TFBot", "RandomChoice"]
    const dispatch = createEventDispatcher();
    let wavetype : string = ""

    $: {
        const content = wavespawn.getPopFormat()
        console.log("Wavespawn loaded to editor", content)
        kvpairs = []
        
        for (const [name, value] of content.entries()) 
        {
            if(ignoreK.includes(name)){continue}
            //console.log(name, content.get(name))
            let v = content.get(name)
            kvpairs.push([name, v])
            
        }
        kvpairs = kvpairs
        wavetype = wavespawn.getWaveType()
    }   

    function onKVChange(event) {
        wavespawn.updateKV(event.detail.Key, event.detail.Value)
        dispatch("WavespawnUpdate")
    }

    function newKeyvalueChange(event) {
        newkey = event.target.value
    }

    function addNewKey(event) {
        wavespawn.updateKV(newkey, "")
        kvpairs = kvpairs
        dispatch("WavespawnUpdate")
        //console.log("Added to", kvpairs)
    }

    function handleDrop(event: DragEvent) {
        //When Something is Dragged ONTO THIS wavebar
        event.preventDefault();

        if (event.dataTransfer.types.includes("templatename")) {
            console.log("Dropping Template");
            //Dropping template in wavebar
            const temname = event.dataTransfer.getData("templatename");
            //waveinfo.addTemplateAsWaveSpawn(STATICACCESS.findTemplate(temname));
            wavespawn.addTemplateAsBot(STATICACCESS.findTemplate(temname))
            //console.log("Wavespawnlist:", wavespawnlist);
        }
        kvpairs = kvpairs
        wavetype = wavespawn.getWaveType()
        dispatch("WavespawnUpdate");
    }

    function handleDragOver(event) {
        event.preventDefault();
    }
</script>

<div>
    {#each kvpairs as kv}
        <Kvlineedit key={kv[0]} value={kv[1]} on:KVChange={onKVChange}/>
    {/each}
    <input on:input={newKeyvalueChange}>
    <button on:click={addNewKey}>Add Key Value Pair</button>
    <p>{wavetype}:</p>
    <div class="icons" on:drop={handleDrop} on:dragover={handleDragOver}>
        {#each wavespawn.getBots() as bot}
            <Boticon bot={bot}/>
        {/each}
    </div>
    
</div>

<style>
    .icons {
        position: relative;
        overflow: scroll;
        display: flex;
        flex-direction: row;
        white-space: nowrap;
        min-height: 80px;
        min-width: 80px;
        max-width: 100%;
        border: 1px solid #2d2d2d;
        margin-left: 6px;
        margin-right: 6px;
        margin-bottom: 6px;
    }
</style>