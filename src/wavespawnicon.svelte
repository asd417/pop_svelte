<script lang="ts">
    import type { WaveSpawn } from "./wavespawn";
    import Iconvisual from "./iconvisual.svelte";
    import { STATICACCESS } from "./App.svelte";
    import { Template } from "./templateLoader";
    export let wavespawn: WaveSpawn;
    export let waveelement;
    
    let isDragged = false;
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    function handleDragStart(event:DragEvent) {
        // Store the initial coordinates of the draggable element
        startX = event.clientX;
        startY = event.clientY;
        isDragged = true;
        let dragged = event.target as HTMLElement
        event.dataTransfer.setData("wavespawnid",wavespawn.getID())
        event.dataTransfer.setData("waveid",wavespawn.wave.getID())
        event.dataTransfer.setData("draggedID",dragged.id)
    }

    function handleDragEnd(event) {
        // Store the final coordinates of the draggable element
        endX = event.clientX;
        endY = event.clientY;
        isDragged = false;
    }

    function clicked(){
        console.log(wavespawn)
        wavespawn = wavespawn
        dispatch('wavespawnSelectEvent', { wavespawn: wavespawn });
    }

    //use:action to call function on element creation

</script>

<button class="wavespawn" 
    id={Date.now().toString(36) + Math.random().toString(36).substring(2)} 
    on:dragstart={handleDragStart} 
    on:dragend={handleDragEnd} 
    on:click={clicked} 
    draggable="true" 
    bind:this={waveelement}
>   <p class="wavespawn_info" style="text-align: left;margin:0px">
    {wavespawn.getName()}
    </p>
    <div class="wavespawn_bots">
        {#if wavespawn.isRandomChoice()}
            <p class="wavespawn_info">
                Random Choice:
            </p>
        {/if}
        {#each wavespawn.getBots() as bot}
        <div style="margin:1px">
            {#if bot.templateOrigin == ""}
            <Iconvisual isgatebot={bot.isGatebot} iconname={bot.classIcon} isGiant={bot.isGiant} alwaysCrit={bot.alwaysCrit} templateorigin={""}/>
            {:else}
            <Iconvisual isgatebot={bot.isGatebot} iconname={""} isGiant={false} alwaysCrit={false} templateorigin={bot.templateOrigin}/>
            {/if}
            <Iconvisual template={bot}/>
        </div>
        {/each}
        {#if wavespawn.isSupport()}
            <p class="wavespawn_info">
                Infinite Support
            </p>
        {:else}
            <p class="wavespawn_info">
                x {wavespawn.getPerBot()}
            </p>
        {/if}
    </div>
    
    
</button>



<style>
    @import "./global_styles.css";
    
    .wavespawn_info {
        color: #ede4e0; 
        padding-left: 10px;
        padding-right: 10px;
    }
    .wavespawn {
        background-color: #303030;
        border-radius: 10px
    }
    .wavespawn_bots {
        cursor: pointer;
        width: auto;
        
        min-height: 55px;
        display:flex;
        flex-direction: row;
        margin-top: 2px;
        margin-bottom: 2px;
        align-items: center;}
</style>
