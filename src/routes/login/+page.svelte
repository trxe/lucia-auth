<!-- routes/login/+page.svelte -->
<script lang="ts">
    import { enhance } from "$app/forms";
</script>

<h1>Sign in</h1>
<form method="post" use:enhance>
    <label for="username">Username</label>
    <input name="username" id="username" /><br />
    <label for="password">Password</label>
    <input type="password" name="password" id="password" /><br />
    <button>Continue</button>
</form>
<a href="/login/twitter">Sign in with Twitter</a>
<a href="/login/discord">Sign in with Discord</a>
