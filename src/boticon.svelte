<script lang="ts">
    import Iconvisual from "./iconvisual.svelte";
    import type { Template } from "./templateLoader";
    import type { WaveSpawn } from "./wavespawn";
    import { createEventDispatcher } from "svelte";

    export let wavespawn: WaveSpawn;
    export let bot: Template;
    export let index: number;
    export let editing: boolean;

    let thisbutton: HTMLButtonElement;

    $: {
        if (thisbutton != undefined) {
            if (editing) {
                thisbutton.style.backgroundColor = "#fcfae6";
            } else {
                thisbutton.style.backgroundColor = "";
            }
        }
    }

    const dispatch = createEventDispatcher();

    function handleDragStart(event: DragEvent) {
        // Store the initial coordinates of the draggable element
        event.dataTransfer.setData("wavespawnid", wavespawn.getID());
        event.dataTransfer.setData("botindex", index.toString());
    }

    function handleDragEnd(event) {}

    function botEditEvent() {
        dispatch("botEditEvent", { Bot: bot, Index: index });
        //thisbutton.style.backgroundColor = "#FFFF"
    }
</script>

<button
    on:dragstart={handleDragStart}
    on:dragend={handleDragEnd}
    on:click={botEditEvent}
    bind:this={thisbutton}
    draggable="true"
    class="blockEditorMove"
    >
    <Iconvisual template={bot}/>

</button>

<style>
</style>
