<script lang="ts">
    import type { WaveSpawn } from "./wavespawn";
    import Iconvisual from "./iconvisual.svelte";
    import Boticon from "./boticon.svelte";
    import Kvlineedit from "./kvlineedit.svelte";
    import { createEventDispatcher } from "svelte";
    import { STATICACCESS } from "./App.svelte";
    import { to_number } from "svelte/internal";
    import type { Template } from "./templateLoader";
    export let wavespawn: WaveSpawn;
    let kvpairs: Array<Array<string>> = [];
    let newkey = "";

    const ignoreK = ["Squad", "TFBot", "RandomChoice"];
    const dispatch = createEventDispatcher();
    let wavetype: string = "";

    let botEdit = false;
    let botEditTemplate: Template;
    let editingIndex = -1;
    let botkvpairs: Array<Array<string>> = [];
    let botnewkey = "";

    $: {
        // Wavespawn editor
        const content = wavespawn.getPopFormat();
        console.log("Wavespawn loaded to editor", content);
        kvpairs = [];

        for (const [name, value] of content.entries()) {
            if (ignoreK.includes(name)) {
                continue;
            }
            //console.log(name, content.get(name))
            let v = content.get(name);
            kvpairs.push([name, v]);
        }
        kvpairs = kvpairs;
        wavetype = wavespawn.getWaveType();

        //Bot editor
        if (editingIndex >= wavespawn.getBots().length) {
            editingIndex = -1;
            botEdit = false;
        }
        if (botEdit) {
            botkvpairs = []
            const botContent = botEditTemplate.getdata()[0];
            console.log("Bot loaded to editor", botEditTemplate);

            for (const [name, value] of botContent.entries()) {
                if (ignoreK.includes(name)) {
                    continue;
                }
                //console.log(name, content.get(name))
                let v = content.get(name);
                botkvpairs.push([name, v]);
            }
            botkvpairs = botkvpairs;
        }
    }

    function onKVChange(event) {
        wavespawn.updateKV(event.detail.Key, event.detail.Value);
        dispatch("WavespawnUpdate");
    }

    
    function onBotKVChange(event) {
        botEditTemplate.updateKV(event.detail.Key,event.detail.Value);
        dispatch("WavespawnUpdate");
    }

    function newKeyvalueChange(event) {
        newkey = event.target.value;
    }

    function botNewKeyvalueChange(event) {
        botnewkey = event.target.value;
    }

    function addNewKey(event) {
        wavespawn.updateKV(newkey, "");
        kvpairs = kvpairs;
        dispatch("WavespawnUpdate");
        //console.log("Added to", kvpairs)
    }

    function botAddNewKey(event) {
        botEditTemplate.updateKV(newkey, "");
        botkvpairs = botkvpairs;
        dispatch("WavespawnUpdate");
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
            wavespawn.addTemplateAsBot(STATICACCESS.findTemplate(temname));
            //console.log("Wavespawnlist:", wavespawnlist);
        } else if (event.dataTransfer.types.includes("botindex")) {
            console.log("Reordering bots");
            const move_i = to_number(event.dataTransfer.getData("botindex"));
        }
        kvpairs = kvpairs;
        wavetype = wavespawn.getWaveType();
        dispatch("WavespawnUpdate");
    }

    function handleDragOver(event) {
        event.preventDefault();
    }
    function onBotEditEvent(event) {
        botEdit = true;
        editingIndex = event.detail.Index;
        botEditTemplate = event.detail.Bot;
    }

</script>

<div class="editormain">
    <div>
        {#each kvpairs as kv}
            <Kvlineedit key={kv[0]} value={kv[1]} on:KVChange={onKVChange} />
        {/each}
        <input on:input={newKeyvalueChange} />
        <button on:click={addNewKey}>Add Key Value Pair</button>
        <p style="margin:5px">{wavetype}:</p>
        <div class="icons" on:drop={handleDrop} on:dragover={handleDragOver}>
            {#each wavespawn.getBots() as bot, index}
                <Boticon
                    {wavespawn}
                    {bot}
                    {index}
                    editing={editingIndex == index}
                    on:botEditEvent={onBotEditEvent}
                />
            {/each}
        </div>
    </div>
    <div class="vertical-separator" />
    {#if botEdit}
        <div>
            {#each botkvpairs as kv}
                <Kvlineedit key={kv[0]} value={kv[1]} on:KVChange={onBotKVChange} />
            {/each}
            <input on:input={botNewKeyvalueChange} />
            <button on:click={botAddNewKey}>Add Key Value Pair</button>
        </div>
    {/if}
</div>

<style>
    .editormain {
        display: flex;
        flex-direction: row;
        height: auto;
    }
    .icons {
        overflow: auto;
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
    .vertical-separator {
        width: 1px; /* Adjust the width as needed */
        background-color: rgb(76, 76, 76); /* Adjust the color as needed */
        margin: 10px;
        min-height: 300px;
    }
</style>
