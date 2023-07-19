<script lang="ts">
    import { STATICACCESS } from "./App.svelte";
    import { Template } from "./templateLoader";
    export let iconname: String
    export let isGiant: boolean
    export let alwaysCrit: boolean
    export let templateorigin: string

    let thisnode : HTMLElement
    
    export const updateIcon = onUpdateIcon
    
    function loaded(node: HTMLElement)
    {
        thisnode = node
        onUpdateIcon()
    }
    $ : {
        //console.log("Icon updated", iconname, alwaysCrit, isGiant)
        onUpdateIcon()
    }

    function onUpdateIcon(){
        //console.log("On Update Icon:", iconname, alwaysCrit, isGiant)
        if(templateorigin != ""){
            //console.log(`Icon for template: ${templateorigin}, searching...`)
            let tem = STATICACCESS.findTemplate(templateorigin)
            //console.log("template: ",tem)
            if(tem != undefined){
                //console.log(`Found Icon for template: ${templateorigin}`)
                iconname = tem.classIcon
                isGiant = tem.isGiant
                alwaysCrit = tem.alwaysCrit
            }
        }
        if (thisnode == undefined){
            return
        }
        thisnode.classList.remove("iconGiantCritContainer")
        thisnode.classList.remove("iconCritContainer")
        thisnode.classList.remove("iconGiantContainer")
        thisnode.classList.remove("iconContainer")
        if (alwaysCrit) {
            if (isGiant) {
                thisnode.classList.add("iconGiantCritContainer");
            } else {
                thisnode.classList.add("iconCritContainer");
            }
        } else if (isGiant) {
            thisnode.classList.add("iconGiantContainer");
        } else {
            thisnode.classList.add("iconContainer");
        }
    }
</script>

<div class="Icon" use:loaded draggable="false">
    <img
    src={"icons/leaderboard_class_" + iconname + ".png"}
    alt="Icon Not Found"
    draggable="false"
    />
</div>
