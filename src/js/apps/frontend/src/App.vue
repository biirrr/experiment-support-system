<template>
    <div id="app" class="frontend">
        <template v-if="$store.state.ui.loaded">
            <page-renderer v-if="currentPage" :page="currentPage"/>
            <study-completed v-else-if="$store.state.progress.completed"/>
            <div v-if="$store.state.ui.busy" class="busy-overlay"></div>
            <div v-if="$store.state.experiment.attributes.status === 'development'" class="reset-experiment">
                <button class="button alert" @click="resetExperiment">
                    <svg viewBox="0 0 24 24" class="mdi icon">
                        <path d="M2 12C2 17 6 21 11 21C13.4 21 15.7 20.1 17.4 18.4L15.9 16.9C14.6 18.3 12.9 19 11 19C4.8 19 1.6 11.5 6.1 7.1S18 5.8 18 12H15L19 16H19.1L23 12H20C20 7 16 3 11 3S2 7 2 12M10 15H12V17H10V15M10 7H12V13H10V7" />
                    </svg>
                </button>
            </div>
        </template>
        <div v-else class="busy-overlay">
            <div class="loading">
                <svg viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="80" fill="none" stroke-width="12" />
                    <circle cx="100" cy="100" r="80" fill="none" stroke-width="12" stroke-dasharray="502.654" :stroke-dashoffset="(1 - progress) * 502.654" />
                </svg>
                <span>Loading...</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import PageRenderer from '@/components/PageRenderer.vue';
import StudyCompleted from '@/components/StudyCompleted.vue';

@Component({
    components: {
        PageRenderer,
        StudyCompleted,
    },
})
export default class App extends Vue {
    public get experiment() {
        return this.$store.state.experiment;
    }

    public get progress() {
        if (this.$store.state.ui.busyMaxCounter > 0) {
            return (this.$store.state.ui.busyMaxCounter - this.$store.state.ui.busyCounter) / this.$store.state.ui.busyMaxCounter;
        } else {
            return -1;
        }
    }

    public get currentPage() {
        return this.$store.state.progress.current;
    }

    public mounted() {
        const configElement = document.getElementById('ExperimentFrontendConfig');
        if (configElement) {
            const config = JSON.parse(configElement.innerHTML);
            if (config) {
                this.$store.dispatch('init', config);
            }
        }
    }

    public resetExperiment() {
        this.$store.dispatch('developmentResetExperiment');
    }
}
</script>
