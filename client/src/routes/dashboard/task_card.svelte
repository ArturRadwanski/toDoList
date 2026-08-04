<script lang="ts">
    import type Tag from "$lib/types/tag";
    import type Task from "$lib/types/task";
    import { PUBLIC_API_URL } from "$env/static/public";

    let {task}:{task:Task} = $props();

    import { useDashboardState } from "./shared_dashboard_state.svelte";
    const dashboard = useDashboardState();
    let tagObjects = dashboard.tags;

    async function deleteTask() {
        const response = await fetch(`${PUBLIC_API_URL}/task/`, {
            method: "DELETE",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({taskId: task.id}),
            credentials: "include"
        })
        if(!response.ok){
            alert(`Server returned response "${response.status} ${response.statusText}",
            task was not deleted`);
            return;
        }
        dashboard.deleteTask(task.id);
    }

    function editTask(){
        dashboard.openEditModal(task);
    }
</script>

<style>
    #card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-radius: var(--radius-card);
        background-color: white;
        padding: 5px;
        margin: 5px;
    }
    .tag {
        border-radius: 20%;
        padding: 5px;
        margin: 2px;
        font-size: 15px;
    }
    #delete-task {
        justify-self: right;
    }
    #tag-container {
        display:flex;
        flex-direction:row;
    }
</style>

<div id="card">
    <input type="checkbox" bind:checked={task.ended}>
    <h4>{task.name}</h4>
    <p class="tags">priority: 
        {#if task.priority == 0}
        "low"
        {:else if task.priority == 1}
        "medium"
        {:else}
        high
        {/if}
    </p>
    <div id="tag-container">
    {#each task.tags as tagId}
    {@const currentTag = tagObjects.find(t => t.id === tagId)}
    {#if currentTag}
        <p class="tag"
        style:background-color="hsl({currentTag.hue}, {currentTag.saturation}%, {currentTag.lightness}%)"
        style:color="{currentTag.lightness > 60 ? "black" : "white"}"
        >{currentTag.name} </p>
    {/if}
    {/each}
    </div>
    <button id="delete-task" onclick={deleteTask}>Delete task</button>
    <button id="edit-task" onclick={editTask}>Edit task</button>
</div>