<script lang="ts">
    import { Link } from 'svelte-navigator';

    export let to: string;
    export let title: string = undefined;
</script>

<Link to={to} title={title} class="text-primary hover:text-primary-dark hover:underline focus:text-primary-dark focus:underline transition transition-colors"><slot></slot></Link>
