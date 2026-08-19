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
    let lookFor = $state<string>("");

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

<div id="main-container">
    <header class="main-header">
        <h2>Your Tasks</h2>
        
    
        <div class="search-wrapper">
            <input 
                type="text" 
                id="task-search" 
                placeholder="Search for task..." 
                bind:value={lookFor}
            />
        </div>
    </header>


    <div id="select-container">
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
                <span>Low</span>
            </label>
            <label class="dropdown-item">
                <input type="checkbox" bind:group={selectedPriorities} value={1} />
                <span>Medium</span>
            </label>
            <label class="dropdown-item">
                <input type="checkbox" bind:group={selectedPriorities} value={2} />
                <span>High</span>
            </label>
        </CustomSelect>

        <CustomSelect title="Date Range">
            <label class="dropdown-item date-input-label">
                <span class="date-prefix">From:</span>
                <input type="date" class="date-picker" bind:value={startDate}/>
            </label>
            <label class="dropdown-item date-input-label">
                <span class="date-prefix">To:</span>
                <input type="date" class="date-picker" bind:value={endDate}/>
            </label>
            <div class="dropdown-item date-quick-actions">
                <button class="filter-btn" onclick={filterAllDates}>All</button>
                <button class="filter-btn" onclick={filterToday}>Today</button>
            </div>
        </CustomSelect>

        <CustomSelect title="Status">
            <label class="dropdown-item">
                <input type="radio" bind:group={status} value={null}/>
                <span>All</span> 
            </label>
            <label class="dropdown-item">
                <input type="radio" bind:group={status} value={true}/>
                <span>Completed</span> 
            </label>
            <label class="dropdown-item">
                <input type="radio" bind:group={status} value={false}/>
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

    <div id="task-container">
        {#each sortedTasks as task (task.id)}
            {@const included = 
                (selectedTags.length === 0 || task.tags.some(element => selectedTags.includes(element)))
                && selectedPriorities.includes(task.priority) 
                && (startDate === null || task.requiredBy >= Date.parse(startDate))
                && (endDate === null || task.requiredBy <= Date.parse(endDate))
                && (status === null || status === task.ended)
                && (task.name.includes(lookFor) || lookFor.trim() === "")}
            {#if included}
                <TaskCard {task}/>
            {/if}
        {/each}
    </div>
</div>

<style>
    #main-container {
        display: flex;
        flex-direction: column;
        flex: 1;
        height: 100%;
        padding: 24px;
        background-color: var(--color-bg, #F4F6F9);
        border-top-right-radius: var(--radius-main, 16px);
        border-bottom-right-radius: var(--radius-main, 16px);
        box-sizing: border-box;
        gap: 16px;
        position: relative;
        min-height: 0;
    }

    .main-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
    }

    .main-header h2 {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
        color: var(--color-title, #1a1a1a);
        white-space: nowrap;
    }

    .search-wrapper {
        flex: 1;
        max-width: 320px;
    }

    #task-search {
        width: 100%;
        padding: 8px 14px;
        border: 1px solid var(--border-description, #e9ecef);
        border-radius: var(--radius-card, 12px);
        background-color: var(--color-card, #FFFFFF);
        font-size: 14px;
        color: var(--color-text-main, #1D2A44);
        outline: none;
        box-sizing: border-box;
        transition: border-color 0.2s, box-shadow 0.2s;
    }

    #task-search:focus {
        border-color: var(--color-primary, #007BFF);
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }

    #select-container {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        padding-bottom: 4px;
        position: relative;
        z-index: 10;
    }

    :global(.dropdown-item) {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 14px;
        color: var(--color-text-main, #1D2A44);
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        gap: 10px;
        border-radius: 6px;
        transition: background-color 0.15s ease;
    }

    :global(.dropdown-item:hover) {
        background-color: var(--color-bg, #F4F6F9); 
    }

    :global(.dropdown-item input[type="checkbox"]),
    :global(.dropdown-item input[type="radio"]) {
        accent-color: var(--color-primary, #007BFF); 
        width: 15px;
        height: 15px;
        cursor: pointer;
    }

    .date-input-label {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .date-prefix {
        font-size: 12px;
        color: var(--color-text-muted, #7D8A99);
        font-weight: 600;
    }

    .date-picker {
        border: 1px solid var(--border-description, #e9ecef);
        border-radius: 6px;
        padding: 4px 6px;
        font-size: 12px;
        background-color: var(--bg-meta-grid, #f8f9fa);
        color: var(--color-text-main, #1D2A44);
        outline: none;
    }

    .date-quick-actions {
        display: flex;
        justify-content: flex-end;
        gap: 6px;
        border-top: 1px solid var(--border-description, #e9ecef);
        margin-top: 4px;
        padding-top: 8px;
    }

    .filter-btn {
        padding: 4px 10px;
        border-radius: 6px;
        border: none;
        background-color: var(--btn-secondary-bg, #e9ecef);
        color: var(--btn-secondary-text, #495057);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.15s;
    }

    .filter-btn:hover {
        background-color: #dee2e6;
    }

    #task-container {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow-y: auto;
        padding-right: 4px;
    }

    #task-container::-webkit-scrollbar {
        width: 6px;
    }

    #task-container::-webkit-scrollbar-track {
        background: transparent;
    }

    #task-container::-webkit-scrollbar-thumb {
        background: #d0d7de;
        border-radius: 10px;
    }

    #task-container::-webkit-scrollbar-thumb:hover {
        background: #b0b8c1;
    }
</style>
