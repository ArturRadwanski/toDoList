<script lang="ts">
    import type Tag from "$lib/types/tag";
    const {priority, tags, name}:{priority: number, tags:string[], name:string} = $props();
</script>

<style>
    #card {
        display: flex;
        align-items: center;
    }
</style>

<div id="card">
    <input type="checkbox">
    <h4>{name}</h4>
    <p>priority: {priority}</p>
    {#each tags as tag}
        <p>{tag} </p>
    {/each}
</div>