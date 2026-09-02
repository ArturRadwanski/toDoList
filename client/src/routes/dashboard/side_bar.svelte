<script lang="ts">
    import type Task from "$lib/types/task";
    import type Tag from "$lib/types/tag";
    import { userState } from "$lib/userState.svelte";
    import { useDashboardState } from "./shared_dashboard_state.svelte";
    import { PUBLIC_API_URL } from "$env/static/public";
    import { goto } from "$app/navigation";
    
    let sharedState = useDashboardState();

    async function logOut() {
        const response = await fetch(`${PUBLIC_API_URL}/user/logout`, {
            method: "POST",
            credentials: "include"
        })
        if(response.ok){
            goto("/");
        }
        else{
            alert(`Server returned ${response.status}: ${response.statusText}`);
        }
    }
    

</script>

<div id="sidebar-container">
    <div class="sidebar-header">
        <div class="brand-logo">TL</div>
        <h2>TaskList</h2>
    </div>

    <div id="bookmarks">
        <button class="btn-sidebar btn-primary" onclick={() => sharedState.openCreateModal()}>
            <span class="btn-icon">+</span> Add Task
        </button>
        <button class="btn-sidebar btn-secondary" onclick={() => sharedState.openTagModal()}>
            <span class="btn-icon">+</span> Add Tag
        </button>
        <button class="btn-sidebar btn-dangerous" onclick={() => sharedState.setRemoveTagsMode(true)}>
            <span class="btn-icon">-</span> Remove Tags
        </button>
    </div>

    <div id="account">
        <div class="user-info">
            <div class="avatar-placeholder">
                {userState.nickname ? userState.nickname[0].toUpperCase() : 'U'}
            </div>
            <div class="user-details">
                <span class="user-label">Logged in as</span>
                <span class="user-name">{userState.nickname}</span>
            </div>
        </div>

        <div class="account-actions">
            <button class="btn-account btn-logout" onclick={logOut}>Log out</button>
        </div>
    </div>
</div>

<style>
    #sidebar-container {
        background-color: var(--color-sidebar, #1E293B);
        color: var(--color-text-sidebar, #F8FAFC);
        border-top-left-radius: var(--radius-main, 16px);
        border-bottom-left-radius: var(--radius-main, 16px);
        padding: 24px;
        display: flex;
        flex-direction: column;
        width: 240px;
        min-width: 240px;
        height: 100%;
        box-sizing: border-box;
    }

    .sidebar-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 28px;
        padding: 0 4px;
    }

    .brand-logo {
        width: 32px;
        height: 32px;
        background-color: var(--color-primary, #007BFF);
        color: #ffffff;
        font-weight: 800;
        font-size: 14px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .sidebar-header h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        letter-spacing: -0.3px;
        color: #ffffff;
    }

    #bookmarks {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .btn-sidebar {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 14px;
        border-radius: var(--radius-card, 10px);
        font-size: 14px;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: background-color 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;
    }

    .btn-sidebar:active {
        transform: scale(0.98);
    }

    .btn-icon {
        font-size: 16px;
        font-weight: 400;
        line-height: 1;
    }

    .btn-primary {
        background-color: var(--color-primary, #007BFF);
        color: #ffffff;
    }

    .btn-primary:hover {
        background-color: #0069d9;
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.25);
    }

    .btn-secondary {
        background-color: rgba(255, 255, 255, 0.08);
        color: #F8FAFC;
        border: 1px solid rgba(255, 255, 255, 0.12);
    }

    .btn-secondary:hover {
        background-color: rgba(255, 255, 255, 0.15);
    }

    .btn-dangerous {
        background-color:color-mix(in srgb, var(--btn-danger-bg) 70%, transparent) ;
        color: color-mix(in srgb, var(--btn-danger-text) 60%, transparent) ;
        border: 1px solid rgba(255, 255, 255, 0.12);
    }

    .btn-dangerous:hover {
        background-color:color-mix(in srgb, var(--btn-danger-bg) 90%, transparent) ;
        color: color-mix(in srgb, var(--btn-danger-text) 80%, transparent) ;
    }
    

    #account {
        margin-top: auto;
        padding-top: 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.12);
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .user-info {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 4px;
    }

    .avatar-placeholder {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.15);
        color: #ffffff;
        font-weight: 700;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .user-details {
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .user-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--color-text-muted, #94A3B8);
    }

    .user-name {
        font-size: 13px;
        font-weight: 600;
        color: #ffffff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .account-actions {
        display: flex;
        gap: 6px;
    }

    .btn-account {
        flex: 1;
        padding: 6px 10px;
        border-radius: 6px;
        border: none;
        background-color: rgba(255, 255, 255, 0.06);
        color: #CBD5E1;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.15s ease, color 0.15s ease;
    }

    .btn-account:hover {
        background-color: rgba(255, 255, 255, 0.12);
        color: #ffffff;
    }

    .btn-logout {
        color: #FCA5A5;
    }

    .btn-logout:hover {
        background-color: rgba(239, 68, 68, 0.2);
        color: #F87171;
    }
</style>

