<script lang="ts">
    import { Route } from 'svelte-navigator';

    import { Index, Create, View, Screens } from './experiments';
</script>

<Route path="/"><Index/></Route>
<Route path="/create"><Create/></Route>
<Route path="/:eid"><View/></Route>
<Route path="/:eid/screens/*"><Screens/></Route>
