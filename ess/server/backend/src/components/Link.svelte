<script lang="ts">
    import { Link } from 'svelte-navigator';

    export let to: string;
    export let title: string = undefined;
</script>

<Link to={to} title={title} class="text-secondary hover:text-secondary-dark hover:underline focus:text-secondary-dark focus:underline transition transition-colors"><slot></slot></Link>
