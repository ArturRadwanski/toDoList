<script lang="ts">
    import CustomSelect from "./custom_select.svelte";
    import { useDashboardState } from "./shared_dashboard_state.svelte";
    import { PUBLIC_API_URL } from "$env/static/public";
    import type Task from "$lib/types/task";

    let sharedState = useDashboardState();

    let activeTask = sharedState.activeTask!;
    const initialTags = Array.from(activeTask.tags || []);
    let tags = sharedState.tags;

    let dateString = $derived.by(() => {
        return {
            get value() {
                if (!activeTask.requiredBy) return '';
                return new Date(activeTask.requiredBy).toISOString().slice(0, 10);
            },
            set value(newDateStr: string) {
                if (newDateStr) {
                    activeTask.requiredBy = new Date(newDateStr).getTime(); 
                } else {
                    activeTask.requiredBy = Date.now();
                }
            }
        };
    });

    function setupDialog(node: HTMLDialogElement) {
        node.showModal();
    }

    function assertIsCompleteTask(task: Partial<Task>): asserts task is Omit<Task, 'id' | 'ended'> {
        if (!activeTask.name || !activeTask.description || activeTask.priority === undefined || !activeTask.tags) {
            throw new Error("task incomplete");
        }
    }

    async function addTask() {
        const response = await fetch(`${PUBLIC_API_URL}/task`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify(activeTask),
        });
        
        if (response.ok) {
            const data: {taskId: number} = await response.json();
            try {
                assertIsCompleteTask(activeTask);
                sharedState.addTask({...activeTask, id: data.taskId, ended: false});
                sharedState.closeModal();
            } catch {
                alert("Something went wrong. Try refreshing the page and if the problem persists, contact administrator.");
            }
        } else {
            alert(`Server sent response: "${response.status} ${response.statusText}". Task wasn't added to your list`);
        }
    }

    async function editTask() {
        const newTags = activeTask.tags?.filter(tag => !initialTags.includes(tag));
        const removedTags = initialTags.filter(tag => !activeTask.tags?.includes(tag));
        const response = await fetch(`${PUBLIC_API_URL}/task`, {
            method: "PUT",
            credentials: "include",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({...activeTask, newTags, removedTags})
        });

        if (!response.ok) {
            alert(`Server returned ${response.status} ${response.statusText}. Your task was not edited`);
            return;
        }
        sharedState.editTask(activeTask.id!, activeTask);
        sharedState.closeModal();
    }
</script>

<dialog
    use:setupDialog
    onclose={() => sharedState.closeModal()}
>
    <div id="container">
        <header class="modal-header">
            <h3>{activeTask.id === undefined ? 'Create New Task' : 'Edit Task'}</h3>
            <button class="close-btn" onclick={() => sharedState.closeModal()} aria-label="Close">✕</button>
        </header>

        <div class="form-body">
            <div class="input-container">
                <label for="task-name" class="meta-label">Task Name</label>
                <input id="task-name" type="text" placeholder="Enter task title..." bind:value={activeTask.name}/>
            </div>

            <div class="input-container">
                <label for="task-desc" class="meta-label">Description</label>
                <textarea id="task-desc" placeholder="Add additional details..." bind:value={activeTask.description}></textarea>
            </div>

            <div class="form-row">
                <div class="input-container flex-1">
                    <label for="task-date" class="meta-label">Required By</label>
                    <input id="task-date" type="date" bind:value={dateString}/>
                </div>

                <div class="input-container flex-1">
                    <label for="task-prio" class="meta-label">Priority</label>
                    <select id="task-prio" bind:value={activeTask.priority}>
                        <option value={0}>Low</option>
                        <option value={1}>Medium</option>
                        <option value={2}>High</option>
                    </select>
                </div>
            </div>

            <div class="input-container">
                <span class="meta-label">Tags</span>
                <CustomSelect title="Select Tags">
                    {#each tags as tag (tag.id)}
                        <label class="dropdown-item">
                            <input type="checkbox" bind:group={activeTask.tags} value={tag.id}/>
                            <span>{tag.name}</span>
                        </label>
                    {/each}    
                </CustomSelect>
            </div>
        </div>

        <footer class="modal-footer">
            <button class="btn btn-secondary" onclick={() => sharedState.closeModal()}>Cancel</button>
            {#if activeTask.id === undefined}
                <button class="btn btn-primary" onclick={addTask}>Add Task</button>
            {:else}
                <button class="btn btn-primary" onclick={editTask}>Save Changes</button>
            {/if}
        </footer>
    </div>
</dialog>

<style>
    dialog {
        border: none;
        border-radius: var(--radius-card, 16px);
        padding: 0;
        width: 100%;
        max-width: 500px;
        background: #ffffff;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        overflow: hidden;
    }

    dialog::backdrop {
        background-color: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(3px);
    }

    #container {
        display: flex;
        flex-direction: column;
        padding: 24px;
        gap: 20px;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .modal-header h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        color: #1a1a1a;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 16px;
        color: #888888;
        cursor: pointer;
        padding: 4px;
        border-radius: 6px;
    }

    .close-btn:hover {
        color: #1a1a1a;
        background-color: #f8f9fa;
    }
    .form-body {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .form-row {
        display: flex;
        gap: 12px;
    }

    .flex-1 {
        flex: 1;
    }

    .input-container {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .meta-label {
        font-size: 11px;
        font-weight: 700;
        color: #6c757d;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    input[type="text"],
    input[type="date"],
    textarea,
    select {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #e9ecef;
        border-radius: var(--radius-main, 8px);
        background-color: #f8f9fa;
        font-size: 14px;
        color: #1a1a1a;
        box-sizing: border-box;
        outline: none;
        transition: border-color 0.2s, background-color 0.2s;
    }

    input[type="text"]:focus,
    input[type="date"]:focus,
    textarea:focus,
    select:focus {
        border-color: var(--color-primary, #007BFF);
        background-color: #ffffff;
    }

    textarea {
        resize: vertical;
        min-height: 80px;
        max-height: 160px;
        font-family: inherit;
    }

    .dropdown-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        color: #1D2A44;
        cursor: pointer;
        font-size: 14px;
        border-radius: 6px;
        transition: background-color 0.15s;
    }

    .dropdown-item:hover {
        background-color: #F4F6F9;
    }

    .dropdown-item input[type="checkbox"] {
        accent-color: var(--color-primary, #007BFF);
        width: 16px;
        height: 16px;
        cursor: pointer;
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 8px;
    }

    .btn {
        padding: 8px 16px;
        border-radius: var(--radius-main, 8px);
        border: none;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: filter 0.2s, transform 0.1s;
    }

    .btn:active {
        transform: scale(0.97);
    }

    .btn-primary {
        background-color: var(--color-primary, #007BFF);
        color: whitesmoke;
    }

    .btn-primary:hover {
        filter: brightness(1.08);
    }

    .btn-secondary {
        background-color: #e9ecef;
        color: #495057;
    }

    .btn-secondary:hover {
        background-color: #dee2e6;
    }
</style>