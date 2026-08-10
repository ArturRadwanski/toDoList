<script lang="ts" >
    import { useDashboardState } from "./shared_dashboard_state.svelte";
    import {PUBLIC_API_URL} from "$env/static/public"

    let sharedState = useDashboardState();
    let activeTag = sharedState.activeTag!; // window closes when active tag is null

    function setupDialog(node:HTMLDialogElement){
        node.showModal();
    }

    function hexToHsv(hex: string): {hue:number, saturation:number, lightness:number} {
        let r = parseInt(hex.slice(1, 3), 16) / 255;
        let g = parseInt(hex.slice(3, 5), 16) / 255;
        let b = parseInt(hex.slice(5, 7), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;

        let hue = 0;
        if (diff !== 0) {
            if (max === r) hue = ((g - b) / diff) % 6;
            else if (max === g) hue = (b - r) / diff + 2;
            else hue = (r - g) / diff + 4;
            hue = Math.round(hue * 60);
            if (hue < 0) hue += 360;
        }

        const saturation = max === 0 ? 0 : Math.round((diff / max) * 100);
        const lightness = Math.round(max * 100);

        return { hue, saturation, lightness };
    }

    function hsvToHex({ hue, saturation, lightness }: {hue:number, saturation:number, lightness:number}): string {
        const sNorm = saturation / 100;
        const vNorm = lightness / 100;

        const f = (n: number) => {
            const k = (n + hue / 60) % 6;
            const color = vNorm - vNorm * sNorm * Math.max(0, Math.min(k, 4 - k, 1));
            return Math.round(color * 255).toString(16).padStart(2, '0');
        };

        return `#${f(5)}${f(3)}${f(1)}`;
    }

    let hexColor = $derived.by(() => {
        return {
            get value() {
                return hsvToHex({hue:activeTag.hue, saturation:activeTag.saturation, lightness:activeTag.lightness});
            },
            set value(newHex: string) {
                const hsvColor = hexToHsv(newHex);
                activeTag.hue = hsvColor.hue;
                activeTag.saturation = hsvColor.saturation;
                activeTag.lightness = hsvColor.lightness;
            }
        };
    });

    async function addTag(){
        const response = await fetch(`${PUBLIC_API_URL}/tag`, { 
            method: "POST",
            credentials: "include",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify({
                color: hexToHsv(hexColor.value),
                name: activeTag.name
            })
        });

        if (!response.ok){
            alert(`Server responded: ${response.status}: ${response.statusText}. Tag was not created`);
            return;
        }
        const {id}: {id:number} = await response.json()
        activeTag.id = id;

        sharedState.addTag(activeTag);
        sharedState.closeTagModal();
    }
</script>

<dialog use:setupDialog onclose={() => sharedState.closeTagModal()}>
    <div id="container">
        <header class="modal-header">
            <h3>Add Tag</h3>
            <button class="close-btn" onclick={() => sharedState.closeTagModal()} aria-label="Close">✕</button>
        </header>

        <div class="form-body">
            <div class="preview-box">
                <span class="meta-label">Preview</span>
                <div class="preview-tag-wrapper">
                    <p 
                        class="tag"
                        style:background-color="hsl({activeTag.hue}, {activeTag.saturation}%, {activeTag.lightness}%)"
                        style:color="{activeTag.lightness > 60 ? 'black' : 'white'}"
                    >
                        {activeTag.name || 'Tag Name'}
                    </p>
                </div>
            </div>
            <div class="input-container">
                <label for="tag-name" class="meta-label">Name</label>
                <input id="tag-name" type="text" bind:value={activeTag.name} placeholder="e.g. Work, Urgent..."/>
            </div>

            <div class="input-container">
                <label for="tag-color" class="meta-label">Color</label>
                <div class="color-picker-row">
                    <input 
                        id="tag-color"
                        type="color" 
                        bind:value={hexColor.value} 
                        onchange={() => console.log(activeTag)}
                        class="color-picker-input"
                    />
                    <span class="color-hex-text">{hexColor.value.toUpperCase()}</span>
                </div>
            </div>
        </div>

        <footer class="modal-footer">
            <button class="btn btn-secondary" onclick={() => sharedState.closeTagModal()}>Cancel</button>
            <button class="btn btn-primary" onclick={addTag}>Add</button>
        </footer>
    </div>
</dialog>

<style>
    dialog {
        border: none;
        border-radius: var(--radius-card, 16px);
        padding: 0;
        width: 100%;
        max-width: 400px;
        background: #ffffff;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        overflow: hidden;
    }

    dialog::backdrop {
        background-color: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(3px);
    }

    #container {
        display: flex;
        flex-direction: column;
        padding: 24px;
        gap: 20px;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .modal-header h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        color: #1a1a1a;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 16px;
        color: #888888;
        cursor: pointer;
        padding: 4px;
        border-radius: 6px;
    }

    .close-btn:hover {
        color: #1a1a1a;
        background-color: #f8f9fa;
    }

    .form-body {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .input-container {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .meta-label {
        font-size: 11px;
        font-weight: 700;
        color: #6c757d;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* Podgląd na żywo */
    .preview-box {
        display: flex;
        flex-direction: column;
        gap: 8px;
        background-color: #f8f9fa;
        padding: 12px;
        border-radius: var(--radius-main, 8px);
        align-items: center;
    }

    .preview-tag-wrapper {
        min-height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .tag {
        padding: 6px 14px;
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        border-radius: 8px;
        transition: background-color 0.15s ease, color 0.15s ease;
    }

    input[type="text"] {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #e9ecef;
        border-radius: var(--radius-main, 8px);
        background-color: #f8f9fa;
        font-size: 14px;
        color: #1a1a1a;
        box-sizing: border-box;
        outline: none;
        transition: border-color 0.2s, background-color 0.2s;
    }

    input[type="text"]:focus {
        border-color: var(--color-primary, #007BFF);
        background-color: #ffffff;
    }

    /* Color Picker */
    .color-picker-row {
        display: flex;
        align-items: center;
        gap: 12px;
        background-color: #f8f9fa;
        padding: 6px 12px;
        border: 1px solid #e9ecef;
        border-radius: var(--radius-main, 8px);
    }

    .color-picker-input {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        width: 32px;
        height: 32px;
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0;
    }

    .color-picker-input::-webkit-color-swatch-wrapper {
        padding: 0;
    }

    .color-picker-input::-webkit-color-swatch {
        border: 1px solid rgba(0, 0, 0, 0.15);
        border-radius: 6px;
    }

    .color-picker-input::-moz-color-swatch {
        border: 1px solid rgba(0, 0, 0, 0.15);
        border-radius: 6px;
    }

    .color-hex-text {
        font-size: 14px;
        font-weight: 600;
        color: #495057;
        font-family: monospace;
    }

    /* Stopka */
    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 8px;
    }

    .btn {
        padding: 8px 16px;
        border-radius: var(--radius-main, 8px);
        border: none;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: filter 0.2s, transform 0.1s;
    }

    .btn:active {
        transform: scale(0.97);
    }

    .btn-primary {
        background-color: var(--color-primary, #007BFF);
        color: whitesmoke;
    }

    .btn-primary:hover {
        filter: brightness(1.08);
    }

    .btn-secondary {
        background-color: #e9ecef;
        color: #495057;
    }

    .btn-secondary:hover {
        background-color: #dee2e6;
    }
</style>