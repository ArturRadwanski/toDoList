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
    if (!activeTask.name || !activeTask.description || activeTask.priority === undefined || !activeTask.tags)
        {
            throw new Error("task incomplete");
        }
}

async function addTask() {
   
    const response = await fetch(`${PUBLIC_API_URL}/task`, 
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify(activeTask),
        }
        
    )
    if(response.ok) {
        const data: {taskId: number} = await response.json();
        try{
            assertIsCompleteTask(activeTask);
            sharedState.addTask({...activeTask, id: data.taskId, ended: false});
            sharedState.closeModal();
        }
        catch {
            alert("Something went wrong. Try refreshing the page and if the problem persits, contact administrator.");
        }
    }
    else {
        alert(`Server sent response: "${response.status} ${response.statusText}". Task wasn't added to your list`);
    }
}

async function editTask(){
    const newTags = activeTask.tags?.filter(tag => !initialTags.includes(tag));
    const removedTags = initialTags.filter(tag => !activeTask.tags?.includes(tag));
    const response = await fetch(`${PUBLIC_API_URL}/task`, {
        method: "PUT",
        credentials: "include",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({...activeTask, newTags, removedTags})
    });

    if(!response.ok){
        alert(`Server returned ${response.status} ${response.statusText}. Your task was not edited`)
        return;
    }
    sharedState.editTask(activeTask.id!, activeTask); // response was ok so id must exist
    sharedState.closeModal();

}
</script>


<style>
    dialog {
        width: 40vw;
        height: 60vh;
    }
    #container {
        display: flex;
        flex-direction: column;
    }
    .input-container {
        display: flex;
        justify-content: space-between;
        margin: 5px;
    }
    input {
        margin: 0 10px;
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
<dialog
    use:setupDialog
    onclose = {() => sharedState.closeModal()}
>
<div id="container">
    <div class="input-container">
        <span>name</span>
        <input type="text" bind:value={activeTask.name}/>
        
    </div>
    <div class="input-container">
        <span>description</span>
        <textarea bind:value={activeTask.description} >
        </textarea>
    </div>
    <div class="input-container">
        <span>requred by</span>
        <input type="date" bind:value={dateString}/>
        
    </div>
    <div class="input-container">
        <span>priority</span>
        <select>
            <option value=0>low</option>
            <option value=1>medium</option>
            <option value=2>high</option>
        </select>
    </div>
    <div class="input-container">
        <CustomSelect title="Tags">
            {#each tags as tag (tag.id)}
                <label class="dropdown-item">
                    <input type="checkbox" bind:group={activeTask.tags} value={tag.id}/>
                    <span>{tag.name}</span>
                </label>
            {/each}    
        </CustomSelect>
    </div>
    <div>
        {#if activeTask.id === undefined}
        <button onclick={addTask}>Add</button>
        {:else}
            <button onclick={editTask}>Edit</button>
        {/if}
        <button onclick={() => sharedState.closeModal()}>Cancel</button>
    </div>
</div>
    
</dialog>