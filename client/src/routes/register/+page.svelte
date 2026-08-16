<script lang="ts">
    import login_background from "$lib/assets/login_background.jpg";
    import { goto } from "$app/navigation";
    import BackgroundImage from "../../components/background_image.svelte";
    import { PUBLIC_API_URL } from "$env/static/public";
    import { userState } from "$lib/userState.svelte";

    let err_message = $state("");

    let nickname = $state("");
    let password = $state("");
    let passwordRepeat = $state("");
    let email = $state("");

    let passwordTip = $derived.by(() => {
        if(password.length < 8) {
            return "Passoword should have length of at least 8 characters";
        }
        else if(password !== passwordRepeat) {
            return "Passwords do not match";
        }
        else {
            return "";
        }
    });

    async function onclick(e: MouseEvent){
        const respone = await fetch(`${PUBLIC_API_URL}/user/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({nickname, password, email})
        })
        if(!respone.ok){
            err_message = respone.statusText;
        }
        else {
            userState.setNickname(nickname.trim())
            goto("/dashboard");
        }
    }
</script>
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
        width: 420px;
        border-radius: var(--radius-main);
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
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 24px;
    }
    .login-form {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-content: center;
        text-align: right;
    }
    input {
        margin: 8px;
        height: 24px;
    }
    button {
        height: 32px;
        background-color: var(--color-primary);
        color: whitesmoke;
        border: none;
        border-radius: var(--radius-main);
        cursor: pointer;
    }
    button:hover:not(:disabled) {
    filter: brightness(1.1);
    }

    button:active:not(:disabled) {
    transform: scale(0.96); 
    filter: brightness(0.9); 
}

    button:disabled {
        filter: grayscale();
        cursor: default;
    }
    .error{
        color: red;
    }
</style>


<BackgroundImage image_source = {login_background} />
<div class="container" >
<div class="outer">
    <h1>TaskFlow</h1>
    <div class="inner">
        <h2>Welcome!</h2>
        <div class="login-form">
            <input type="text" placeholder="Email" name="email" id="email" bind:value={email}/>
            <input type="text" placeholder="Nickname" name="nickname" id="nickname" bind:value={nickname}/>
            <input type="password" placeholder="Password" name="password" id="password" bind:value={password}/>
            <p>{passwordTip}</p>
            <input type="password" placeholder="Repeat password" name="passwordRepeat" id="password-repeat" bind:value={passwordRepeat}/>
            <button disabled="{passwordTip !== ""}" {onclick}>Sign up</button>
        </div>
        <p>Already have an account? <a href="/"><b>Log in</b></a></p>
        {#if err_message != ""}
            <p class="error">{err_message}</p>
        {/if}
    </div>
</div>
</div>
