<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { validate_each_keys, validate_slots } from "svelte/internal";

    export let key
    export let value : any
    let arrayValue : boolean = false
    let inputIndex : number = 0

    $ : {
        arrayValue = Array.isArray(value)
    }

    const dispatch = createEventDispatcher();

    function valueChange(event, index: number){
        if(Array.isArray(value)){
            value[index] = event.target.value
        } else {
            value = event.target.value
        }
        dispatchKVChange()
    }

    function dispatchKVChange(){
        dispatch("KVChange", {Key: key, Value : value})
    }

    function addEntry(event){
        if(!Array.isArray(value)){
            value = [value]
        }
        value.push("")
        value = value
    }
    function removeLastEntry(event){
        if(Array.isArray(value)){
            value.pop()
            if(value.length == 1){
                value = value[0]
            }
        }
        value = value
        dispatchKVChange()
    }
    function removeThisKV(event){
        arrayValue = false
        value = ""
        dispatch("KVRemove", {Key: key})
    }
</script>

<div class="kvline">
    <button class="close" on:click={removeThisKV}>x</button>

    <p style="padding-right:4px">
        {key} : 
    </p>
    
    <div style="display: flex; flex-direction:column;margin-left: auto; margin-right: 0;">
        {#if arrayValue}
            {#each value as v, index}
                <input value={v} on:input={(event)=> {valueChange(event, index)}}>
            {/each}
        {:else}
            <input value={value} on:input={(event)=> {valueChange(event, 0)}} style="margin-left: auto; margin-right: 0;">
        {/if}
        <div style="display: flex; flex-direction:row;margin-left: auto; margin-right: 0;">
            <button on:click={addEntry} style="margin-left: auto; margin-right: 0;font-size: small;line-height:7px;width: fit-content;">+</button>
            <button on:click={removeLastEntry} style="margin-left: auto; margin-right: 0;font-size: small;line-height:7px;width: fit-content;">-</button>
        </div>
        
    </div>

</div>

<style>
    .close {
        left: 5px;
        top: 2px;
        height: 20px;
        line-height: 7px;
        opacity: 0.5;
        border: 0px;
        border-radius: 5px;
        background-color: #919191;
        z-index: 2;
    }
    .close:hover {
        opacity: 1;
    }
    .close:active {
        background-color: transparent;
    }
    .kvline {
        padding-left: 5px;
        padding-right: 5px;
        display: flex;
        flex-direction: row;
        white-space: nowrap;
        pointer-events: visible;
    }
</style>