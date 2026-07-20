<script lang="ts">
    import type Tag from "$lib/types/tag";
    const {priority, tags, name}:{priority: number, tags:number[], name:string} = $props();

    import { useDashboardState } from "./shared_dashboard_state.svelte";
    const dashboard = useDashboardState();
    let tagObjects = dashboard.tags;
</script>

<style>
    #card {
        display: flex;
        align-items: center;
        border-radius: var(--radius-card);
        background-color: white;
        padding: 0;
        margin: 5px;
    }
    .tags {
        border-radius: 20%;
        padding: 5px;
        margin: 2px;
        font-size: 15px;
    }
</style>

<div id="card">
    <input type="checkbox">
    <h4>{name}</h4>
    <p class="tags">priority: 
        {#if priority == 0}
        "low"
        {:else if priority == 1}
        "medium"
        {:else}
        high
        {/if}
    </p>
    {#each tags as tagId}
    {@const currentTag = tagObjects.find(t => t.id === tagId)}
    {#if currentTag}
        <p class="tags"
        style:background-color="hsl({currentTag.hue}, {currentTag.saturation}%, {currentTag.lightness + 40}%)"
        style:color="hsl({currentTag.hue}, {currentTag.saturation}%, {currentTag.lightness - 20}%)"
        >{currentTag.name} </p>
    {/if}
        
    {/each}
</div>