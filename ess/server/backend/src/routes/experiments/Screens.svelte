<script lang="ts">
    import { Route, useParams } from 'svelte-navigator';
    import { onDestroy } from 'svelte';

    import { Create, View } from './screns';
    import { experiment } from '../../stores';

    const params = useParams();

    const paramsUnsubscribe = params.subscribe((params) => {
        experiment.fetch(Number.parseInt(params.eid));
    });

    onDestroy(paramsUnsubscribe);
</script>

<Route path="/create"><Create/></Route>
<Route path="/:sid"><View/></Route>
