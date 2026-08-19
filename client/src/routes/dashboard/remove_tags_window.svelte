<script lang="ts">
    import { PUBLIC_API_URL } from '$env/static/public';
    import type Tag from '$lib/types/tag';
    import { useDashboardState } from './shared_dashboard_state.svelte';
    
    let sharedState = useDashboardState();

    
    let tagToDelete = $state<Tag | null>(null);

    function confirmDelete(tag: Tag) {
        tagToDelete = tag;
    }

    async function deleteTag() {
        //tagToDelete is non zero guaranteed by svelte #if
        const tagCopy = JSON.parse(JSON.stringify(tagToDelete));
        tagToDelete = null;
        sharedState.deleteTag(tagCopy.id);
        const response = await fetch(`${PUBLIC_API_URL}/tag/${tagCopy.id}`, {
            method: "DELETE",
            credentials: "include",
        });
        
        if(!response.ok) {
            sharedState.addTag(tagCopy);
            alert(`${response.status} ${response.statusText}. Could not delete tag`);
        }
        else {
            sharedState.removeTagFromTasks(tagCopy.id);
        }



    }

    function cancelDelete() {
        tagToDelete = null;
    }

    function setupDialog(node:HTMLDialogElement){
        node.showModal();
    }

</script>


<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
    <dialog class="modal-card" use:setupDialog onclose = {() => sharedState.setRemoveTagsMode(false)}>
    
        <div class="modal-header">
            <h3>Manage Tags</h3>
        </div>

        <div class="modal-body">
            {#if tagToDelete}
                <div class="confirm-box">
                    <p>Are you sure you want to delete tag <strong>"{tagToDelete.name}"</strong>?</p>
                    <span class="warning-text">This will remove the tag from all assigned tasks.</span>
                    
                    <div class="confirm-actions">
                        <button class="btn btn-secondary" onclick={cancelDelete}>Cancel</button>
                        <button class="btn btn-danger" onclick={deleteTag}>Delete</button>
                    </div>
                </div>
            {:else}
                {#if sharedState.tags.length === 0}
                    <div class="empty-state">
                        <p>No tags available.</p>
                    </div>
                {:else}
                    <ul class="tag-list">
                        {#each sharedState.tags as tag (tag.id)}
                            <li class="tag-item">
                                <span 
                                    class="tag-badge"
                                    style:background-color="hsl({tag.hue}, {tag.saturation}%, {tag.lightness}%)"
                                    style:color={tag.lightness > 60 ? "#000000" : "#ffffff"}
                                >
                                    {tag.name}
                                </span>

                                <button 
                                    class="btn-delete-tag" 
                                    onclick={() => confirmDelete(tag)}
                                    title="Delete tag"
                                    aria-label="Delete tag {tag.name}"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </li>
                        {/each}
                    </ul>
                {/if}
            {/if}
        </div>

        <div class="modal-footer">
            <button class="btn btn-secondary" onclick={() => sharedState.setRemoveTagsMode(false)}>Close</button>
        </div>
    </dialog>

<style>

    .modal-card {
        background-color: var(--color-card, #FFFFFF);
        border-radius: var(--radius-main, 16px);
        width: 100%;
        max-width: 420px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        border: 1px solid var(--border-description, #E2E8F0);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: scaleUp 0.15s ease-out;
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--border-description, #E2E8F0);
    }

    .modal-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: var(--color-title, #0F172A);
    }

    .btn-close {
        background: none;
        border: none;
        font-size: 18px;
        color: var(--color-text-muted, #64748B);
        cursor: pointer;
        padding: 4px;
        border-radius: 6px;
        transition: background-color 0.15s;
    }

    .btn-close:hover {
        background-color: var(--color-bg, #F1F5F9);
        color: var(--color-text-main, #0F172A);
    }

    .modal-body {
        padding: 20px;
        max-height: 360px;
        overflow-y: auto;
    }

    .tag-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .tag-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        background-color: var(--color-bg, #F8FAFC);
        border-radius: var(--radius-card, 8px);
        border: 1px solid var(--border-description, #F1F5F9);
        transition: background-color 0.15s;
    }

    .tag-item:hover {
        background-color: color-mix(in srgb, var(--color-bg, #F8FAFC) 80%, #000000 5%);
    }

    .tag-badge {
        font-size: 12px;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 6px;
        line-height: 1.4;
    }

    .btn-delete-tag {
        background: none;
        border: none;
        color: var(--color-text-muted, #94A3B8);
        cursor: pointer;
        padding: 6px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.15s, background-color 0.15s;
    }

    .btn-delete-tag:hover {
        color: var(--btn-danger-text, #EF4444);
        background-color: color-mix(in srgb, var(--btn-danger-bg, #FEE2E2) 60%, transparent);
    }

    .confirm-box {
        display: flex;
        flex-direction: column;
        gap: 12px;
        text-align: center;
        padding: 8px 0;
    }

    .confirm-box p {
        margin: 0;
        font-size: 14px;
        color: var(--color-text-main, #0F172A);
    }

    .warning-text {
        font-size: 12px;
        color: var(--color-text-muted, #64748B);
    }

    .confirm-actions {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-top: 8px;
    }

    .empty-state {
        text-align: center;
        padding: 24px 0;
        color: var(--color-text-muted, #94A3B8);
        font-size: 14px;
    }

    .modal-footer {
        padding: 12px 20px;
        background-color: var(--color-bg, #F8FAFC);
        border-top: 1px solid var(--border-description, #E2E8F0);
        display: flex;
        justify-content: flex-end;
    }

    .btn {
        padding: 8px 16px;
        border-radius: var(--radius-card, 8px);
        font-size: 13px;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: background-color 0.15s, transform 0.1s;
    }

    .btn:active {
        transform: scale(0.97);
    }

    .btn-secondary {
        background-color: var(--btn-secondary-bg, #E2E8F0);
        color: var(--btn-secondary-text, #334155);
    }

    .btn-secondary:hover {
        background-color: #CBD5E1;
    }

    .btn-danger {
        background-color: var(--btn-danger-bg, #EF4444);
        color: #FFFFFF;
    }

    .btn-danger:hover {
        background-color: #DC2626;
    }

</style>