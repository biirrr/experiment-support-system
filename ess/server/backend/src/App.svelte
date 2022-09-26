<script lang="ts">
    import { Router } from 'svelte-navigator';

    import Content from './Content.svelte';
</script>

<div class="bg-neutral-900 text-white min-h-screen">
    <main class="container mx-auto">
        <Router>
            <Content/>
        </Router>
    </main>
</div>

<style global>
    @tailwind utilities;
    @tailwind components;
    @tailwind base;
</style>
