<script lang="ts">
    import { Link } from 'svelte-navigator';

    export let to: string;
    export let title: string = undefined;
</script>

<Link to={to} title={title} class="inline-block px-2 py-1 text-neutral-900 bg-primary hover:bg-primary-light focus:bg-primary-light transition transition-colours rounded"><slot></slot></Link>
