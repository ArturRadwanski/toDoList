<script lang="ts">
    let isOpen = $state(false); // Stan otwarcia (Svelte 5)
  
  function toggleDropdown() {
    isOpen = !isOpen;
    console.log("click dropdown");
    console.log(isOpen);
    //ToDo:
    //Counting how many are checked           X
    //Dynamic Tags to display                 X
    //Sending info to parent about checks     X
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

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  color: #1D2A44;
  cursor: pointer;
  font-size: 14px;
  gap: 10px;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #F4F6F9; 
}

.dropdown-item input[type="checkbox"] {
  accent-color: #007BFF; 
  width: 16px;
  height: 16px;
  cursor: pointer;
}
</style>


<div class="dropdown">
  <button class="dropdown-button" onclick={toggleDropdown}>
    Tags (2) <span class="arrow">▾</span>
  </button>

    {#if isOpen}
        <div class="dropdown-menu">
    <label class="dropdown-item">
      <input type="checkbox" checked />
      <span class="custom-checkbox"></span>
      Work
    </label>
    
    <label class="dropdown-item">
      <input type="checkbox" checked />
      <span class="custom-checkbox"></span>
      Urgent
    </label>
    
    <label class="dropdown-item">
      <input type="checkbox" />
      <span class="custom-checkbox"></span>
      Personal
    </label>
  </div>      
    {/if}
  
</div>