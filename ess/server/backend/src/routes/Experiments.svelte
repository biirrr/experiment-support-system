<script lang="ts">
    import { Route } from 'svelte-navigator';

    import { Index, Create, View } from './experiments';
</script>

<Route path="/"><Index/></Route>
<Route path="/create"><Create/></Route>
<Route path="/:eid"><View/></Route>
