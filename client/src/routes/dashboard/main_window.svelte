<script lang="ts">
    import type Tag from "$lib/types/tag";
    import CustomSelect from "./custom_select.svelte";
    import type Task from "$lib/types/task";
    import { useDashboardState } from "./shared_dashboard_state.svelte";
    import TaskCard from "./task_card.svelte";

    const dashboard = useDashboardState();
    let tasks = dashboard.tasks;
    let tags = dashboard.tags;
    let selectedTags = $state(tags.map((element) => element.id));
    console.log(tasks);

    function onclick_debug(){
        $inspect(selectedTags)
    }
</script>

<style>
    #container {
        display: flex;
        flex-direction: column;
    }
    #select-container {
        display: flex;
    }

    .dropdown-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  color: #1D2A44;
  cursor: pointer;
  font-size: 14px;
  gap: 10px;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #F4F6F9; 
}

.dropdown-item input[type="checkbox"] {
  accent-color: #007BFF; 
  width: 16px;
  height: 16px;
  cursor: pointer;
}
</style>



<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div id="container" onclick={onclick_debug}>
<h2>Your's Tasks</h2>
<div id="select-container" >
<CustomSelect >
{#each tags as tag}
    <label class="dropdown-item">
      <input type="checkbox" bind:group={selectedTags} value={tag.id} checked/>
      <span>{tag.name}</span>
    </label>
  {/each}    
</CustomSelect>

<!--ToDo rest of the selects-->

</div>
<input type="text" id="taks-search" placeholder="Search for task..." />
<div id="task-container">
    {#each tasks as task (task.id)}
        {console.log(task.tags)}
        {#if task.tags.some(element => selectedTags.includes(element))}
            <TaskCard name = {task.name} priority = {task.priority} tags = {task.tags}/>
        {/if}
    {/each}
</div>
</div>
