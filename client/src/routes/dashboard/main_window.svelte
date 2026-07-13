<script lang="ts">
    import CustomSelect from "./custom_select.svelte";

let { data } = $props();
</script>

<style>
    #container {
        display: flex;
    }
    #select-container {
        display: flex;
    }
</style>

<div id="container">
<h2>Your's Tasks</h2>
<div id="select-container" >
    <CustomSelect />
</div>
</div>
