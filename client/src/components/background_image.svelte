<script lang="ts">
    const {image_source} = $props();
</script>

<style>.background{
        width: 100vw;
        height: 100vh;
        z-index: -1;
        background-repeat: no-repeat;
        background-attachment: fixed;
        background-size: cover;
        background-position: center;
        filter: blur(8px);  
        margin: 0;
        transform: scale(1.05);
        position: fixed;
    }
</style>
<div class="background" style = "background-image: url({image_source})"></div>