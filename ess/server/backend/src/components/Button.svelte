<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let title: string = undefined;
    export let role: string = undefined;

    const dispatch = createEventDispatcher();

    function onClick() {
        dispatch('action');
    }
</script>

<button on:click={onClick} title={title} role={role} class="inline-block px-2 py-1 text-neutral-50 bg-primary hover:bg-primary-light focus:bg-primary-light transition transition-colours rounded"><slot></slot></button>
