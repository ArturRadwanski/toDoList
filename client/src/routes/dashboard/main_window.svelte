<script lang="ts">
    import type Tag from "$lib/types/tag";
    import CustomSelect from "./custom_select.svelte";
    import type Task from "$lib/types/task";
    import { useDashboardState } from "./shared_dashboard_state.svelte";
    import TaskCard from "./task_card.svelte";


    const dashboard = useDashboardState();
    let tasks = dashboard.tasks;
    let tags = dashboard.tags;
    let selectedTags = $state<number[]>([]);
    let selectedPriorities = $state([0,1,2]);
    let startDate = $state<string | null>(null);
    let endDate = $state<string | null>(null);
    let status = $state<boolean | null>(null); //true - show finished, false - show unfinished, null - show all
    let sortBy = $state("requiredBy");

    let sortedTasks = $derived([...tasks].sort((a,b) => {
        if (sortBy === "requiredBy"){
            return a.requiredBy - b.requiredBy;
        }
        else if (sortBy == "name"){
            return a.name.localeCompare(b.name, "en", {sensitivity: 'base'});
        }
        else {
            return a.priority - b.priority;
        }
    }))
    console.log(tasks);

    function filterAllDates(){
        startDate = null;
        endDate = null;
    }
    function filterToday(){
        startDate = new Date().toISOString().slice(0,10);
        endDate = new Date().toISOString().slice(0,10);
        console.log(startDate)
    }

    function quickChangeStatus(task:Task){
        task.ended = !task.ended;
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
  justify-content:space-between;
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
<div id="container">
<h2>Your's Tasks</h2>
<div id="select-container" >
<CustomSelect title="Tags">
{#each tags as tag (tag.id)}
    <label class="dropdown-item">
      <input type="checkbox" bind:group={selectedTags} value={tag.id}/>
      <span>{tag.name}</span>
    </label>
  {/each}    
</CustomSelect>
<CustomSelect title="Priority">
    <label class="dropdown-item">
        <input type="checkbox" bind:group={selectedPriorities} value={0} />
        <span>low</span>
    </label>
    <label class="dropdown-item">
        <input type="checkbox" bind:group={selectedPriorities} value={1} />
        <span>medium</span>
    </label>
    <label class="dropdown-item">
        <input type="checkbox" bind:group={selectedPriorities} value={2} />
        <span>high</span>
    </label>
</CustomSelect>

<CustomSelect title="Date Range">
<label class="dropdown-item">
    <span>from:</span>
    <input type="date" bind:value={startDate}/>
</label>
<label class="dropdown-item">
    <span>to:</span>
    <input type="date" bind:value={endDate}/>
</label>
<div class="dropdown-item">
    <button onclick={filterAllDates}>All</button>
    <button onclick={filterToday}>Today</button>
</div>
</CustomSelect>
<CustomSelect title="Status">
    <label class="dropdown-item">
        <input type="radio" bind:group={status} value = {null}/>
        <span>All</span> 
    </label>
    <label class="dropdown-item">
        <input type="radio" bind:group={status} value = {true}/>
        <span>Completed</span> 
    </label>
    <label class="dropdown-item">
        <input type="radio" bind:group={status} value = {false}/>
        <span>Uncompleted</span> 
    </label>
</CustomSelect>
<CustomSelect title="Sort by">
    <label class="dropdown-item">
        <input type="radio" bind:group={sortBy} value="requiredBy"/>
        <span>Date</span>
    </label>
    <label class="dropdown-item">
        <input type="radio" bind:group={sortBy} value="name"/>
        <span>Name</span>
    </label>
    <label class="dropdown-item">
        <input type="radio" bind:group={sortBy} value="priority"/>
        <span>Priority</span>
    </label>
</CustomSelect>

</div>
<input type="text" id="taks-search" placeholder="Search for task..." />
<div id="task-container">

    {#each sortedTasks as task (task.id)}
        <!--filter tasks by currently selected filters -->
        {@const included = 
        (selectedTags.length === 0 || task.tags.some(element => selectedTags.includes(element)))
        && selectedPriorities.includes(task.priority) 
        && (startDate === null || task.requiredBy >= Date.parse(startDate))
        && (endDate === null || task.requiredBy <= Date.parse(endDate))
        && (status === null || status === task.ended)}
        {#if included}
            <TaskCard {task}/>
        {/if}
    {/each}
</div>
</div>
