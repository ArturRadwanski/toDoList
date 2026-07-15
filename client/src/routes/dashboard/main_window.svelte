<script lang="ts">
    import type Tag from "$lib/types/tag";
    import CustomSelect from "./custom_select.svelte";
    import type Task from "$lib/types/task";
    import { useDashboardState } from "./shared_dashboard_state.svelte";
    import TaskCard from "./task_card.svelte";

    const dashboard = useDashboardState();
    let tasks = dashboard.tasks;
    console.log(tasks);
</script>

<style>
    #container {
        display: flex;
        flex-direction: column;
    }
    #select-container {
        display: flex;
    }
</style>



<div id="container">
<h2>Your's Tasks</h2>
<div id="select-container" >
    <CustomSelect />
</div>
<input type="text" id="taks-search" placeholder="Search for task..." />
<div id="task-container">
    {#each tasks as task (task.id)}
        {console.log(task)}
        <TaskCard name = {task.name}, priority = {task.priority}, tags = {task.tags}/>
    {/each}
</div>
</div>
