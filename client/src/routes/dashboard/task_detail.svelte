<script lang="ts">
    import { PUBLIC_API_URL } from "$env/static/public";
    import { useDashboardState } from "./shared_dashboard_state.svelte";

    const sharedState = useDashboardState();

    let task = $derived(sharedState.selectedTask)!;
    let tags = $derived(sharedState.tags);

    

    function getPriorityLabel(priority: number) {
        if (priority === 0) return { label: 'Low', class: 'low' };
        if (priority === 1) return { label: 'Medium', class: 'medium' };
        return { label: 'High', class: 'high' };
    }

    function formatDate(timestamp: number) {
        if (!timestamp) return 'Brak terminu';
        return new Date(timestamp).toLocaleDateString('pl-PL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    async function handleDelete() {
        if (!task) return;
        
        const response = await fetch(`${PUBLIC_API_URL}/task/`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskId: task.id }),
            credentials: "include"
        });

        if (!response.ok) {
            alert(`Błąd podczas usuwania: ${response.status} ${response.statusText}`);
            return;
        }

        sharedState.deleteTask(task.id);
    }

    function handleEdit() {
        if (!task) return;
        const taskToEdit = task;
        sharedState.closeDetailsModal();
        sharedState.openEditModal(taskToEdit);
    }

    function setupDialog(node: HTMLDialogElement) {
        node.showModal();
    }

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === 'Escape') sharedState.closeDetailsModal();
    }

    const prio = getPriorityLabel(task.priority)
</script>

<svelte:window onkeydown={handleKeyDown} />


  <dialog use:setupDialog onclose={() => sharedState.closeTagModal()}
     class="modal-backdrop">
    <div class="modal-content">
      
      <header class="modal-header">
        <label class="status-checkbox">
            <input type="checkbox" bind:checked={task.ended} />
            <span class="status-text">{task.ended ? 'Wykonane' : 'Do zrobienia'}</span>
        </label>
        <button class="close-btn" onclick={() => sharedState.closeDetailsModal()}>✕</button>
      </header>

      <h2 class="task-name" class:completed={task.ended}>{task.name}</h2>

      <div class="meta-grid">
        <div class="meta-item">
          <span class="meta-label">Priorytet</span>
          <span class="prio-badge {prio.class}">{prio.label}</span>
        </div>

        <div class="meta-item">
          <span class="meta-label">Termin</span>
          <span class="date-value">📅 {formatDate(task.requiredBy)}</span>
        </div>
      </div>

      {#if task.tags && task.tags.length > 0}
        <div class="section">
          <span class="meta-label">Tagi</span>
          <div class="tags-wrapper">
            {#each task.tags as tagId}
              {@const currentTag = tags.find(t => t.id === tagId)}
              {#if currentTag}
                <span 
                  class="tag-pill" 
                  style:background-color="hsl({currentTag.hue}, {currentTag.saturation}%, {currentTag.lightness}%)"
                  style:color={currentTag.lightness > 60 ? "black" : "white"}
                >
                  {currentTag.name}
                </span>
              {/if}
            {/each}
          </div>
        </div>
      {/if}

      <div class="section">
        <span class="meta-label">Opis</span>
        <div class="description-box">
          {task.description || 'Brak opisu dla tego zadania.'}
        </div>
      </div>

      <footer class="modal-footer">
        <div class="left-actions">
            <button class="btn btn-danger" onclick={handleDelete}>Usuń</button>
            <button class="btn btn-secondary" onclick={handleEdit}>Edytuj</button>
        </div>
        <button class="btn btn-primary" onclick={() => sharedState.closeDetailsModal()}>Zamknij</button>
      </footer>

    </div>
</dialog>

<style>
  .modal-backdrop {
    

    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: var(--backdrop-bg);
    backdrop-filter: blur(3px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: var(--modal-bg);
    width: 100%;
    max-width: 480px;
    border-radius: var(--radius-card, 12px);
    padding: 20px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .status-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-title);
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 16px;
    cursor: pointer;
    color: var(--color-text-muted);
  }

  .task-name {
    margin: 0;
    font-size: 20px;
    color: var(--color-title);
    transition: color 0.2s ease;
  }

  .task-name.completed {
    text-decoration: line-through;
    color: var(--color-title-completed);
  }

  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    background-color: var(--bg-meta-grid);
    padding: 12px;
    border-radius: 8px;
  }

  .meta-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .meta-label {
    font-size: 11px;
    font-weight: 700;
    color: var(--color-label);
    text-transform: uppercase;
  }

  .date-value {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-date);
  }

  .prio-badge {
    display: inline-block;
    align-self: flex-start;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
  }
  
  .prio-badge.low { 
    background-color: var(--prio-low-bg); 
    color: var(--prio-low-text); 
  }
  .prio-badge.medium { 
    background-color: var(--prio-medium-bg); 
    color: var(--prio-medium-text); 
  }
  .prio-badge.high { 
    background-color: var(--prio-high-bg); 
    color: var(--prio-high-text); 
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .tags-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .tag-pill {
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
  }

  .description-box {
    background-color: var(--bg-description);
    border: 1px solid var(--border-description);
    border-radius: 6px;
    padding: 10px;
    font-size: 14px;
    color: var(--color-title);
    white-space: pre-wrap;
    min-height: 60px;
    max-height: 150px;
    overflow-y: auto;
  }

  .modal-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
  }

  .left-actions {
    display: flex;
    gap: 8px;
  }

  .btn {
    padding: 6px 12px;
    border-radius: 6px;
    border: none;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: filter 0.2s ease, transform 0.1s ease;
  }

  .btn:active {
    transform: scale(0.97);
  }

  .btn-primary { 
    background-color: var(--btn-primary-bg); 
    color: var(--btn-primary-text); 
  }
  .btn-secondary { 
    background-color: var(--btn-secondary-bg); 
    color: var(--btn-secondary-text); 
  }
  .btn-danger { 
    background-color: var(--btn-danger-bg); 
    color: var(--btn-danger-text); 
  }
</style>