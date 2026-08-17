<script lang="ts">
    import type Tag from "$lib/types/tag";
    import type Task from "$lib/types/task";
    import { PUBLIC_API_URL } from "$env/static/public";

    let {task}:{task:Task} = $props();

    import { useDashboardState } from "./shared_dashboard_state.svelte";
    const dashboard = useDashboardState();
    let tagObjects = dashboard.tags;
    let debouncer:number | undefined = undefined;


    async function deleteTask(e:MouseEvent) {
        e.stopPropagation();
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

    function details(){
        dashboard.openDetailsModal(task);
    }

    function toggleTask(e:MouseEvent){
        clearTimeout(debouncer);
        e.stopPropagation();
        const checkbox = e.currentTarget as HTMLInputElement;
        const currentValue = checkbox.checked;
        task.ended = currentValue;


        debouncer = setTimeout(async () => {
            const response = await fetch(`${PUBLIC_API_URL}/task`, {
            method: "PUT",
            credentials: "include",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({...task, newTags: [], removedTags: []})
        });

        if (!response.ok) {
            alert(`Server returned ${response.status} ${response.statusText}. Could not save change`);
            task.ended = !currentValue;
            return;
        }
        }, 500)

    }
    function formatDate() {
        return new Date(task.requiredBy).toLocaleDateString('en-En', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }
    function colorDate(){
        const due = new Date(task.requiredBy)
        const today = new Date();
        const dangerousText = "color: var(--btn-danger-text);";

        //if is split into several cases to increase readability even though it could be squeezed into one long condition
        if (due.getFullYear() < today.getFullYear())
            return dangerousText;
        
        else if(due.getFullYear() === today.getFullYear() && 
                due.getMonth() < today.getMonth()) 
            return dangerousText;

        else if(due.getFullYear() === today.getFullYear() &&
                due.getMonth() === today.getMonth() &&
                due.getDate() <= today.getDate())
            return dangerousText;
        else 
            return ""
    }
</script>
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="task-card" class:completed={task.ended} onclick={details}>
    <input 
        type="checkbox" 
        onclick={toggleTask}
        class="task-checkbox"
    />

    <div class="task-info">
        
        <h4 class="task-title">{task.name}</h4>
        <div class="task-meta">
            <span class="priority-badge prio-{task.priority}">
                {#if task.priority == 0}
                    Low
                {:else if task.priority == 1}
                    Medium
                {:else}
                    High
                {/if}
            </span>

            {#if task.tags && task.tags.length > 0}
                <div class="tag-container">
                    {#each task.tags as tagId}
                        {@const currentTag = tagObjects.find(t => t.id === tagId)}
                        {#if currentTag}
                            <span 
                                class="tag"
                                style:background-color="hsl({currentTag.hue}, {currentTag.saturation}%, {currentTag.lightness}%)"
                                style:color={currentTag.lightness > 60 ? "#000000" : "#ffffff"}
                            >
                                {currentTag.name}
                            </span>
                        {/if}
                    {/each}
                </div>
            {/if}
        </div>
    </div>

    <div>
        <span style={colorDate()}>📅 {formatDate()}</span>
    </div>

    <div class="task-actions">
        <button class="btn btn-delete" onclick={deleteTask} aria-label="Delete task">
            Delete
        </button>
    </div>
</div>

<style>
    .task-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: var(--color-card, #FFFFFF);
        border-radius: var(--radius-card, 12px);
        padding: 12px 16px;
        margin-bottom: 8px;
        box-shadow: var(--shadow-soft, 0 8px 24px rgba(11, 37, 69, 0.04));
        border: 1px solid var(--border-description, #e9ecef);
        gap: 16px;
        transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.2s ease;
    }

    .task-card:hover {
        box-shadow: 0 4px 16px rgba(11, 37, 69, 0.08);
        background-color: var(--btn-secondary-bg);
    }

    .task-card.completed {
        opacity: 0.65;
        background-color: #fcfcfc;
    }

    .task-card.completed .task-title {
        text-decoration: line-through;
        color: var(--color-title-completed, #888888);
    }

    /* Checkbox po lewej */
    .task-checkbox {
        width: 18px;
        height: 18px;
        cursor: pointer;
        accent-color: var(--color-primary, #007BFF);
        border-radius: 4px;
        flex-shrink: 0;
    }

    /* ŚRODKOWY KONTENER – Wyśrodkowany pionowo i poziomo */
    .task-info {
        display: flex;
        flex-direction: column;
        align-items: center; /* Wyśrodkowanie w poziomie */
        justify-content: center;
        text-align: center;
        flex: 1; /* Zajmuje całą dostępną przestrzeń pomiędzy checkboxem a przyciskami */
        gap: 6px;
        min-width: 0;
    }

    .task-title {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--color-text-main, #1D2A44);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
    }

    .task-meta {
        display: flex;
        align-items: center;
        justify-content: center; /* Wyśrodkowanie priorytetu i tagów */
        gap: 8px;
        flex-wrap: wrap;
    }

    .priority-badge {
        font-size: 11px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 6px;
        text-transform: uppercase;
        letter-spacing: 0.4px;
    }

    .priority-badge.prio-0 {
        background-color: var(--prio-low-bg, #E6F4EA);
        color: var(--prio-low-text, #137333);
    }

    .priority-badge.prio-1 {
        background-color: var(--prio-medium-bg, #FEF7E0);
        color: var(--prio-medium-text, #B06000);
    }

    .priority-badge.prio-2 {
        background-color: var(--prio-high-bg, #FCE8E6);
        color: var(--prio-high-text, #C5221F);
    }

    .tag-container {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        align-items: center;
        justify-content: center;
    }

    .tag {
        font-size: 11px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 6px;
        line-height: 1.4;
        display: inline-block;
    }

    /* Przyciski po prawej */
    .task-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
    }

    .btn {
        padding: 6px 12px;
        border-radius: var(--radius-card, 8px);
        border: none;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.15s ease, transform 0.1s ease;
    }

    .btn:active {
        transform: scale(0.96);
    }

    .btn-details {
        background-color: var(--btn-secondary-bg, #e9ecef);
        color: var(--btn-secondary-text, #495057);
    }

    .btn-details:hover {
        background-color: #dee2e6;
    }

    .btn-delete {
        background-color: var(--btn-danger-bg, #fce8e6);
        color: var(--btn-danger-text, #c5221f);
    }

    .btn-delete:hover {
        background-color: #f8d7da;
    }
</style>