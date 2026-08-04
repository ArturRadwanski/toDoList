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
        <button onclick={() => sharedState.openCreateTag()}>Add Tag</button>
    </div>
    <div id="account">
    <!--TO DO style it correctly-->
    <hr>
        <p>{userState.nickname}</p>
        <button>Settings</button>
        <button onclick={logOut}>Log out</button>
    </div>
</div>

