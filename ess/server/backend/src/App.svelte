<script lang="ts">
    import { Router } from 'svelte-navigator';

    import Content from './Content.svelte';
</script>

<a href="#main-content" class="sr-only focus:fixed focus:top-0 focus:left-1/2 focus:w-auto focus:h-auto focus:[clip:unset] transform -translate-x-1/2 px-6 py-3 z-10 border-b border-l border-r border-neutral-300 rounded-b shadow-lg text-primary hover:text-secondary hover:underline focus:text-secondary focus:underline">Jump to the main content</a>
<div class="min-h-screen">
    <Router basepath="/editor">
        <Content/>
    </Router>
</div>

<style global>
    @tailwind utilities;
    @tailwind components;
    @tailwind base;

    :root {
        --colour-primary: #a21caf;
        --colour-secondary: #ea580c;
    }

    html {
        font-size: 11pt;
    }

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
