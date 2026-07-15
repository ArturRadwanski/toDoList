<script lang="ts">
import BackgroundImage from "../../components/background_image.svelte";
import login_background from "$lib/assets/login_background.jpg"
import SideBar from "./side_bar.svelte";
import MainWindow from "./main_window.svelte";
import type Tag from "$lib/types/tag";
import type { PageData } from "./$types";
import { initDashboardState } from "./shared_dashboard_state.svelte";

let { data }: {data: PageData} = $props();
initDashboardState(data.tasks, data.tags);

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
        border-radius: var(--radius-main);
        width: 640px;
        padding: 32px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        flex-direction: column;
        background-color: rgba(200,200,200,0.3);
        align-items: center;
        justify-content: center;
        filter: none;
    }
    .inner {
        background-color: rgba(200,200,200,0.5);
        border-radius: var(--radius-main);
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 24px;
        flex-direction:row;
    }
    .dashboard{
        color: red;
        background-color: red;
    }
</style>


<BackgroundImage image_source = {login_background} />
<div class="container" >
<div class="outer">
    <h1>TaskFlow</h1>
    <div class="inner">
    <SideBar {data} />
    <MainWindow/>
    </div>
</div>
</div>