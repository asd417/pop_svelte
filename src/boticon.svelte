<script lang="ts">
    import Iconvisual from "./iconvisual.svelte";
    import type { Template } from "./templateLoader";

    export let bot : Template;
</script>

<div>
    {#if bot.templateOrigin == ""}
        <Iconvisual isgatebot={bot.isGatebot} iconname={bot.classIcon} isGiant={bot.isGiant} alwaysCrit={bot.alwaysCrit} templateorigin={""}/>
    {:else}
        <Iconvisual isgatebot={bot.isGatebot} iconname={""} isGiant={false} alwaysCrit={false} templateorigin={bot.templateOrigin}/>
    {/if}
</div>