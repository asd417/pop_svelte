<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { validate_each_keys, validate_slots } from "svelte/internal";

    export let key
    export let value
    let arrayValue : boolean = false
    
    if(Array.isArray(value)){
        arrayValue = true
    }
    const dispatch = createEventDispatcher();

    function valueChange(event){
        console.log("Dispatching: ",{Key: key, Value : event.target.value} )
        dispatch("KVChange", {Key: key, Value : event.target.value})
        
    }
    function addEntry(event){
        if(!arrayValue){
            value = [value]
            arrayValue = true
        }
        value.push("")
        value = value
    }
    function removeLastEntry(event){
        if(arrayValue){
            value.pop()
            arrayValue = false
        }
        value = value
        valueChange(undefined)
    }
</script>

<div class="kvline">
    <p style="padding-right:4px">
        {key} : 
    </p>
    
    <div style="display: flex; flex-direction:column;margin-left: auto; margin-right: 0;">
        {#if arrayValue}
            {#each value as v}
                <input value={v} on:input={valueChange}>
            {/each}
        {:else}
            <input value={value} on:input={valueChange} style="margin-left: auto; margin-right: 0;">
        {/if}
        <div style="display: flex; flex-direction:row;margin-left: auto; margin-right: 0;">
            <button on:click={addEntry} style="margin-left: auto; margin-right: 0;font-size: small;line-height:7px;width: fit-content;">+</button>
            <button on:click={removeLastEntry} style="margin-left: auto; margin-right: 0;font-size: small;line-height:7px;width: fit-content;">-</button>
        </div>
        
    </div>

</div>

<style>
    .kvline {
        padding-left: 5px;
        padding-right: 5px;
        display: flex;
        flex-direction: row;
        white-space: nowrap;
        pointer-events: visible;
    }
</style>