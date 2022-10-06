<script lang="ts">
    import { ButtonLink } from '../components';
    import { currentUser } from '../stores';
</script>

<h1>Welcome, {$currentUser.name}</h1>
<div class="flex flex-row space-x-4">
    <div class="flex-1">
        <h2 class="border-b-2 border-primary dark:border-primary-light">Active Experiments</h2>
        <p>You currently have no active experiments.</p>
    </div>
    <div class="flex-1">
        <h2 class="border-b-2 border-primary dark:border-primary-light">Experiments in Development</h2>
        <p>You currently have no experiments in development.</p>
        <p class="mt-8"><ButtonLink to="/experiments/create">Create a new Experiment</ButtonLink></p>
    </div>
    <div class="flex-1">
        <h2 class="border-b-2 border-primary dark:border-primary-light">Completed Experiments</h2>
        <p>You currently have no completed experiments.</p>
    </div>
</div>
