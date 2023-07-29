<script lang="ts">
    import Kvlineedit from "./kvlineedit.svelte";

    const dispatch = createEventDispatcher();
    export let editingmap : Map<string, any>
    let kvpairs = []

    $: {
        for (const [name, value] of editingmap.entries()) {
            if (ignoreK.includes(name)) {
                continue;
            }
            //console.log(name, content.get(name))
            let v = content.get(name);
            kvpairs.push([name, v]);
        }
        kvpairs = kvpairs;
    }
    
    function onKVChange(event) {
        wavespawn.updateKV(event.detail.Key, event.detail.Value);
        kvpairs = kvpairs;
        dispatch("WavespawnUpdate");
    }

    function onKVRemove(event) {
        wavespawn.removeKV(event.detail.Key)
        kvpairs = kvpairs;
        dispatch("WavespawnUpdate");
    }

    function newKeyvalueChange(event) {
        newkey = event.target.value;
    }

    function addNewKey(event) {
        editingmap.set(newkey, "")
        //wavespawn.updateKV(newkey, "");
        kvpairs = kvpairs;
        dispatch("NestedEditorUpdate");
        //console.log("Added to", kvpairs)
    }

</script>

<div>
    {#each kvpairs as kv}
        <Kvlineedit key={kv[0]} value={kv[1]} on:KVChange={onKVChange} on:KVRemove={onKVRemove}/>
    {/each}
    <input on:input={newKeyvalueChange} />
    <button on:click={addNewKey}>Add Key Value Pair</button>
</div>