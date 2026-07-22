<script lang="ts">
    let {children, title} = $props();
    let isOpen = $state(false);
  
  function toggleDropdown() {
    isOpen = !isOpen;
    console.log("click dropdown");
    console.log(isOpen);
  }
</script>

<style>


.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-button {
  background-color: #E6F0FA; 
  color: #007BFF;
  border: 1px solid #007BFF;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px); /* Pokazuje się tuż pod przyciskiem */
  left: 0;
  background-color: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  min-width: 140px;
  z-index: 100;
  
  display: block; 
}


</style>


<div class="dropdown">
  <button class="dropdown-button" onclick={toggleDropdown}>
    {title} <span class="arrow">▾</span>
  </button>

    {#if isOpen}
        <div class="dropdown-menu">
    {@render children()}
  </div>      
    {/if}
  
</div>