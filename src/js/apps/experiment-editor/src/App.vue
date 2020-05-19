<template>
    <div id="app" class="experiment-editor">
        <div v-if="$store.state.ui.busy" class="busy">
            <progress max="100" :value="progress"/>
            <div class="busy-overlay"></div>
        </div>
        <div v-if="experiment" class="grid-x grid-padding-x">
            <div class="cell auto">
                <h1>{{ experiment.attributes.title }}</h1>
            </div>
            <div class="cell shrink">
                <nav>
                    <ul class="menu">
                        <li>
                            <a :href="$store.state.config.experiment.externalUrl" target="_blank" rel="noopener">
                                <template v-if="experiment.attributes.status === 'development'">
                                    Test the Experiment
                                </template>
                                <template v-else>
                                    Test URL
                                </template>
                            </a>
                        </li>
                        <li>
                            <select @change="changeStatus($event)">
                                <template v-if="experiment.attributes.status === 'development'">
                                    <option value="development" selected="selected">Development</option>
                                    <option value="live">Live</option>
                                </template>
                                <template v-else>
                                    <option value="live" :selected="experiment.attributes.status === 'live' ? 'selected' : null">Live</option>
                                    <option value="paused" :selected="experiment.attributes.status === 'paused' ? 'selected' : null">Pause</option>
                                    <option value="completed" :selected="experiment.attributes.status === 'completed' ? 'selected' : null">Complete</option>
                                </template>
                            </select>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
        <aria-menubar v-slot="{ keyboardNav }">
            <nav class="margin-bottom">
                <ul class="menu" role="menubar">
                    <router-link to="/" v-slot="{ href, navigate, isActive, isExactActive }">
                        <li :class="isExactActive ? 'is-active': ''" role="presentation">
                            <a :href="href" @keyup="keyboardNav" @click="navigate" tabindex="0" role="menuitem">Overview</a>
                        </li>
                    </router-link>
                    <router-link to="/pages" v-slot="{ href, navigate, isActive }">
                        <li :class="isActive ? 'is-active': ''" role="presentation">
                            <a :href="href" @keyup="keyboardNav" @click="navigate" tabindex="-1" role="menuitem">Pages</a>
                        </li>
                    </router-link>
                    <!--<router-link to="/data" v-slot="{ href, navigate, isActive }">
                        <li :class="isActive ? 'is-active': ''" role="presentation">
                            <a :href="href" @keyup="keyboardNav" @click="navigate" tabindex="-1" role="menuitem">Data</a>
                        </li>
                    </router-link>
                    <router-link to="/latin-squares" v-slot="{ href, navigate, isActive }">
                        <li :class="isActive ? 'is-active': ''" role="presentation">
                            <a :href="href" @keyup="keyboardNav" @click="navigate" tabindex="-1" role="menuitem">Latin Squares</a>
                        </li>
                    </router-link>
                    <router-link to="/results" v-slot="{ href, navigate, isActive }">
                        <li :class="isActive ? 'is-active': ''" role="presentation">
                            <a :href="href" @keyup="keyboardNav" @click="navigate" tabindex="-1" role="menuitem">Results</a>
                        </li>
                    </router-link>-->
                    <router-link to="/settings" v-slot="{ href, navigate, isActive }">
                        <li :class="isActive ? 'is-active': ''" role="presentation">
                            <a :href="href" @keyup="keyboardNav" @click="navigate" tabindex="-1" role="menuitem">Settings</a>
                        </li>
                    </router-link>
                </ul>
            </nav>
        </aria-menubar>
        <router-view v-if="experiment"/>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import AriaMenubar from '@/components/AriaMenubar.vue';

@Component({
  components: {
      AriaMenubar
  },
})
export default class App extends Vue {

    public get experiment() {
        return this.$store.state.experiment;
    }

    public get progress() {
        if (this.$store.state.ui.busyMaxCounter > 0) {
            return 100 / this.$store.state.ui.busyMaxCounter * (this.$store.state.ui.busyMaxCounter - this.$store.state.ui.busyCounter);
        } else {
            return 0;
        }
    }

    public mounted() {
        const configElement = document.getElementById('ExperimentEditorConfig');
        if (configElement) {
            const config = JSON.parse(configElement.innerHTML);
            if (config) {
                this.$store.dispatch('init', config);
                this.$store.dispatch('loadExperiment');
            }
        }
    }

    public changeStatus(ev: Event) {
        if (ev && ev.target) {
            this.$store.dispatch('updateExperimentAttribute', {
                attribute: 'status',
                value: (ev.target as HTMLInputElement).value,
            });
        }
    }
}
</script>
