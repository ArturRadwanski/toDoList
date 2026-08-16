<script lang="ts">
import BackgroundImage from "../../components/background_image.svelte";
import login_background from "$lib/assets/login_background.jpg"
import SideBar from "./side_bar.svelte";
import MainWindow from "./main_window.svelte";
import type Tag from "$lib/types/tag";
import type { PageData } from "./$types";
import { initDashboardState } from "./shared_dashboard_state.svelte";
    import AddTaskWindow from "./add_task_window.svelte";
    import AddTagWindow from "./add_tag_window.svelte";
    import TaskDetail from "./task_detail.svelte";

let { data }: {data: PageData} = $props();
let sharedState = initDashboardState(data.tasks, data.tags);

</script>

<BackgroundImage image_source={login_background}/>
<style>
    .container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100vw;
        height: 100vh;
        margin: 0;
        
    }
    
    .outer {
        display: flex;
        box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        flex-direction: column;
        align-items: center;
        justify-content: center;
        filter: none;
    }
    .inner {
        background-color: rgba(220,220,220,0.9);
        border-radius: var(--radius-main);
        display: flex;
        align-items: stretch;
        justify-content: center;
        text-align: center;
        flex-direction:row;
        height: 85vh; 
        overflow: hidden;
    }
    .dashboard{
        color: red;
        background-color: red;
    }
</style>


<BackgroundImage image_source = {login_background} />
<div class="container" >
<div class="outer">
    <div class="inner">
    <SideBar />
    <MainWindow />
    {#if sharedState.activeTask != null}
    <AddTaskWindow />
    {/if}
    {#if sharedState.activeTag != null}
    <AddTagWindow />
    {/if}
    {#if sharedState.selectedTask != null}
    <TaskDetail />
    {/if}
    </div>
</div>
</div>