<template>
    <div class="settings-actions">
        <form :action="$store.state.config.experiment.deleteUrl" method="post" @submit="confirmDeleteExperiment">
            <input type="hidden" name="csrf_token" :value="$store.state.config.dataStore.csrfToken"/>
            <button class="button alert">Delete this Experiment</button>
            <p>This will permanently delete this experiment and all data that is associated with it. This step <strong>cannot</strong> be undone.</p>
        </form>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
    components: {
    }
})
export default class SettingsActions extends Vue {
    public confirmDeleteExperiment(ev: Event): void {
        if (!confirm('Please confirm that you wish to delete this experiment and all data that is associated with it.')) {
            ev.preventDefault();
        }
    }
}
</script>
