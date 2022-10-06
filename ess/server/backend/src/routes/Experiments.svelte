<script lang="ts">
    import { Route } from 'svelte-navigator';

    import { Index, Create } from './experiments';
</script>

<Route path="/"><Index/></Route>
<Route path="/create"><Create/></Route>
