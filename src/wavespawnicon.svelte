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
>
    {#each wavespawn.getBots() as bot}
    <div>
        {#if bot.templateOrigin == ""}
        <Iconvisual iconname={bot.classIcon} isGiant={bot.isGiant} alwaysCrit={bot.alwaysCrit} templateorigin={""}/>
        {:else}
        <Iconvisual iconname={""} isGiant={false} alwaysCrit={false} templateorigin={bot.templateOrigin}/>
        {/if}
        <p class=wavespawn_info>
            {wavespawn.getTotalCount()}
        </p>
    </div>
    {/each}
</button>



<style>
    @import "./global_styles.css";
    .wavespawn_info {
        color: #ede4e0; 
    }
    .wavespawn {
        cursor: pointer;
        width: auto;
        
        min-height: 85px;
        display:flex;
        flex-direction: row;
        
        align-items: center;
        background-color: #5e5750;
        border-radius: 10px}
</style>
