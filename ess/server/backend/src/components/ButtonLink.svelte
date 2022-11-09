<script lang="ts">
    import { Link } from 'svelte-navigator';

    export let to: string;
    export let title: string = undefined;
    export let ariaLabel: string = undefined;
</script>

<Link to={to} title={title} aria-label={ariaLabel} class="inline-block px-2 py-1 border border-primary text-primary hover:text-secondary hover:border-secondary focus:text-secondary focus:border-secondary transition transition-colours rounded"><slot></slot></Link>
