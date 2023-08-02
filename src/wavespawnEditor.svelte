<script lang="ts">
    import Boticon from "./boticon.svelte";
    import Kvlineedit from "./kvlineedit.svelte";
    import { createEventDispatcher } from "svelte";
    import { STATICACCESS } from "./App.svelte";
    import { to_number, update_keyed_each } from "svelte/internal";
    import Codeflask from "codeflask";

    import type { WaveSpawn } from "./wavespawn";
    import type { Template } from "./templateLoader";

    export let wavespawn: WaveSpawn;

    const ignoreK = ["Squad", "TFBot", "RandomChoice"];
    const dispatch = createEventDispatcher();

    let prev_wavespawn: WaveSpawn;
    let wavetype: string = "";

    let kvpairs: Array<Array<any>> = [];
    let newkey = "";

    let botEdit = false;
    let editingIndex = -1;

    let botkvpairs: Array<Array<any>> = [];
    let botnewkey = "";

    let nestedmaps = [];

    let codearea = undefined;
    let codeflaskoutput = "";

    let codeflask = undefined;

    $: {
        //console.log("Update Codeflask : ", updateCodeArea)
        wavespawn = wavespawn;
        botEdit = botEdit;
        if (codearea != undefined && codeflask == undefined) {
            console.log("Codeflask Generated");
            initializeCodeArea();
            updateCodeArea()
        }
        updateWaveSpawnEditor();
        updateBotEditor();
    }

    function updateWaveSpawnEditor() {
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

        if (prev_wavespawn != wavespawn) {
            editingIndex = -1;
            botEdit = false;
        }
        prev_wavespawn = wavespawn;
    }

    function updateBotEditor() {
        //Bot editor
        if (editingIndex >= wavespawn.getBots().length) {
            editingIndex = -1;
            botEdit = false;
        }
        if (botEdit) {
            botkvpairs = [];
            const botContent = wavespawn.getBotAtIndex(editingIndex).getdata()[0];
            console.log("Bot loaded to editor", botContent);

            for (const [name, value] of botContent.entries()) {
                if (ignoreK.includes(name)) {
                    continue;
                }
                //console.log(name, content.get(name))
                const v = botContent.get(name);
                if (typeof v == "string" || typeof v == "number") {
                    botkvpairs.push([name, v]);
                } else if (
                    Array.isArray(v) &&
                    (typeof v[0] == "string" || typeof v[0] == "number")
                ) {
                    botkvpairs.push([name, v]);
                } else if (Array.isArray(v)) {
                    v.forEach((element) => {
                        nestedmaps.push([name, element]);
                    });
                } else {
                    nestedmaps.push([name, v]);
                }
                //console.log(nestedmaps);
            }
            botkvpairs = botkvpairs;
        }
    }
    function updateCodeArea() {
        const code_raw = STATICACCESS.parser.write_pop(wavespawn.getPopFormat(),0);
        codeflask.updateCode(code_raw);
    }
    function initializeCodeArea() {
        codeflask = new Codeflask(codearea, { language: "python" });
        updateCodeArea()
        codeflask.onUpdate(onCodeAreaUpdate);
    }

    function onCodeAreaUpdate(code) {
        codeflaskoutput = code;
        //console.log("Read", code);
        wavespawn.processWaveMap(STATICACCESS.parser.parseExcerpt(code));
        updateWaveSpawnEditor();
        updateBotEditor();
    }

    function onKVChange(event) {
        wavespawn.updateKV(event.detail.Key, event.detail.Value);
        updateWaveSpawnEditor();
        initializeCodeArea()
        dispatch("WavespawnUpdate");
    }

    function onKVRemove(event) {
        wavespawn.removeKV(event.detail.Key);
        updateWaveSpawnEditor();
        initializeCodeArea()
        dispatch("WavespawnUpdate");
    }

    function onBotKVChange(event) {
        wavespawn.getBotAtIndex(editingIndex).updateKV(event.detail.Key, event.detail.Value);
        console.log("ONBOTKVCHANGE");
        updateBotEditor();
        initializeCodeArea()
        dispatch("WavespawnUpdate");
    }

    function onBotKVRemove(event) {
        wavespawn.getBotAtIndex(editingIndex).removeKV(event.detail.Key);
        updateBotEditor();
        initializeCodeArea()
        dispatch("WavespawnUpdate");
    }

    function newKeyvalueChange(event) {
        newkey = event.target.value.trim();
    }

    function botNewKeyvalueChange(event) {
        botnewkey = event.target.value.trim();
    }

    function addNewKey(event) {
        wavespawn.updateKV(newkey, "");
        wavespawn = wavespawn;
        dispatch("WavespawnUpdate");
        //console.log("Added to", kvpairs)
    }

    function botAddNewKey(event) {
        wavespawn.getBotAtIndex(editingIndex).updateKV(botnewkey, "");
        wavespawn = wavespawn;
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
            // Not implemented
        }
        updateBotEditor();
        wavetype = wavespawn.getWaveType();
        dispatch("WavespawnUpdate");
    }

    function handleDragOver(event) {
        event.preventDefault();
    }

    function onBotEditEvent(event) {
        botEdit = true;
        editingIndex = event.detail.Index;
    }
</script>

<div class="editormain">
    <div>
        <div class="blockEditorMove" id="codeflasktest">
            <div bind:this={codearea} />
        </div>
        {#each kvpairs as kv}
            <Kvlineedit
                key={kv[0]}
                value={kv[1]}
                on:KVChange={onKVChange}
                on:KVRemove={onKVRemove}
            />
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
                <Kvlineedit
                    key={kv[0]}
                    value={kv[1]}
                    on:KVChange={onBotKVChange}
                    on:KVRemove={onBotKVRemove}
                />
            {/each}
            <input on:input={botNewKeyvalueChange} />
            <button on:click={botAddNewKey}>Add Key Value Pair</button>
        </div>
    {/if}
</div>

<style>
    #codeflasktest {
        position: relative;
        height: 400px;
        border-radius: 3px;
        box-shadow: 0 2px 2px 0 rgba(#000, 0.14), 0 1px 5px 0 rgba(#000, 0.12),
            0 3px 1px -2px rgba(#000, 0.2);
    }
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
