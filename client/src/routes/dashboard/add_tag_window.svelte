<script lang="ts" >
    import { useDashboardState } from "./shared_dashboard_state.svelte";
    import {PUBLIC_API_URL} from "$env/static/public"

    let sharedState = useDashboardState();
    let activeTag = sharedState.activeTag!; // window closes when active tag is null

    function setupDialog(node:HTMLDialogElement){
        node.showModal();
    }

    function hexToHsv(hex: string): {hue:number, saturation:number, lightness:number} {
        let r = parseInt(hex.slice(1, 3), 16) / 255;
        let g = parseInt(hex.slice(3, 5), 16) / 255;
        let b = parseInt(hex.slice(5, 7), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;

        let hue = 0;
        if (diff !== 0) {
            if (max === r) hue = ((g - b) / diff) % 6;
            else if (max === g) hue = (b - r) / diff + 2;
            else hue = (r - g) / diff + 4;
            hue = Math.round(hue * 60);
            if (hue < 0) hue += 360;
        }

        const saturation = max === 0 ? 0 : Math.round((diff / max) * 100);
        const lightness = Math.round(max * 100);

        return { hue, saturation, lightness };
    }

    function hsvToHex({ hue, saturation, lightness }: {hue:number, saturation:number, lightness:number}): string {
        const sNorm = saturation / 100;
        const vNorm = lightness / 100;

        const f = (n: number) => {
            const k = (n + hue / 60) % 6;
            const color = vNorm - vNorm * sNorm * Math.max(0, Math.min(k, 4 - k, 1));
            return Math.round(color * 255).toString(16).padStart(2, '0');
        };

        return `#${f(5)}${f(3)}${f(1)}`;
    }

    let hexColor = $derived.by(() => {
        return {
            get value() {
                return hsvToHex({hue:activeTag.hue, saturation:activeTag.saturation, lightness:activeTag.lightness});
            },
            set value(newHex: string) {
                const hsvColor = hexToHsv(newHex);
                activeTag.hue = hsvColor.hue;
                activeTag.saturation = hsvColor.saturation;
                activeTag.lightness = hsvColor.lightness;
            }
        };
    });

    async function addTag(){
        const response = await fetch(`${PUBLIC_API_URL}/tag`, { 
            method: "POST",
            credentials: "include",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify({
                color: hexToHsv(hexColor.value),
                name: activeTag.name
            })
        });

        if (!response.ok){
            alert(`Server responded: ${response.status}: ${response.statusText}. Tag was not created`);
            return;
        }
        const {id}: {id:number} = await response.json()
        activeTag.id = id;

        sharedState.addTag(activeTag);
        sharedState.closeCreateTag();


    }
</script>

<style>
        .tag {
        padding: 5px;
        margin: 2px;
        font-size: 15px;
        }
</style>

<dialog use:setupDialog
onclose = {() => sharedState.closeCreateTag()}>
<input type="color" bind:value={hexColor.value} onchange={() => console.log(activeTag)}>

<input type="name" bind:value={activeTag.name}>
<p class="tag"
        style:background-color="hsl({activeTag.hue}, {activeTag.saturation}%, {activeTag.lightness}%)"
        style:color="{activeTag.lightness > 60 ? "black" : "white"}"
        >{activeTag.name} 
</p>
<button onclick={addTag}>Add</button>
<button onclick={() => sharedState.closeCreateTag()}>Cancel</button>
</dialog>