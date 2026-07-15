<script lang="ts">
    import type Task from "$lib/types/task";
    import type Tag from "$lib/types/tag";
    const {data}: {data:{
        tags:Tag[],
        tasks:Task[]
    }} = $props();
    const tags = $state(data.tags)
</script>

<style>
#container {
    background-color: var(--color-sidebar);
    color: whitesmoke;
}
</style>

<div id="container" >
    <h2>TaskFlow</h2>
    <div id="bookmarks">
        <p>Today</p>
        <p>Upcoming</p>
        <p>Important</p>
    </div>
</div>

