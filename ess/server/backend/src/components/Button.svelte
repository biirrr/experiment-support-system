<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let title: string = undefined;
    export let role: string = undefined;

    const dispatch = createEventDispatcher();

    function onClick() {
        dispatch('action');
    }
</script>

<button on:click={onClick} title={title} role={role} class="inline-block px-2 py-1 border border-primary text-primary hover:text-secondary hover:border-secondary focus:text-secondary focus:border-secondary transition transition-colours rounded"><slot></slot></button>
