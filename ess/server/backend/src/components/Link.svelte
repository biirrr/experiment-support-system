<script lang="ts">
    import { Link } from 'svelte-navigator';

    export let to: string;
    export let title: string = undefined;
    export let ariaLabel: string = undefined;
</script>

<Link to={to} title={title} aria-label={ariaLabel} class="text-primary transition transition-colors hover:text-secondary hover:underline focus:text-secondary focus:underline"><slot></slot></Link>
