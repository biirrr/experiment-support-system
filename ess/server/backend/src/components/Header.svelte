<script lang="ts">
    import { Link } from 'svelte-navigator';

    import { login } from '../stores';
</script>

<header class="px-4 py-2 bg-primary-900">
    <nav>
        <ul>
            <li><Link to="/">Experiment Support System</Link></li>
            <li><button on:click={login}>Login</button></li>
        </ul>
    </nav>
</header>
