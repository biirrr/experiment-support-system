<script lang="ts">
    import { Router } from 'svelte-navigator';

    import Content from './Content.svelte';
</script>

<div class="bg-neutral-200 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 min-h-screen">
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

    h1 {
        @apply text-2xl font-bold mb-4;
    }
    h2 {
        @apply text-lg mb-2;
    }
    p {
        @apply mb-2;
    }
</style>
