<script lang="ts">
    import type Task from "$lib/types/task";
    import type Tag from "$lib/types/tag";
    import { userState } from "$lib/userState.svelte";
    import { useDashboardState } from "./shared_dashboard_state.svelte";
    
    let sharedState = useDashboardState();


</script>

<style>
#container {
    background-color: var(--color-sidebar);
    color: whitesmoke;
    border-radius: var(--radius-main) 0 0 var(--radius-main);
    padding: 5px;
}
</style>

<div id="container" >
    <h2>TaskFlow</h2>
    <div id="bookmarks">
        <button onclick={() => sharedState.openCreateModal()}>Add Task</button>
    </div>
    <div id="account">
    <!--TO DO style it correctly-->
    <hr>
        <p>{userState.nickname}</p>
        <button>settings</button>
        <button>Log out</button>
    </div>
</div>

