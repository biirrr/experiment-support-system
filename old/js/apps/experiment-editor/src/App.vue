<template>
    <div id="app" class="experiment-editor">
        <div v-if="progress >= 0" class="busy">
            <progress max="100" :value="progress"/>
            <div v-if="$store.state.ui.busy" class="busy-overlay"></div>
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
                                <template v-else-if="experiment.attributes.status === 'live'">
                                    {{ $store.state.config.experiment.externalUrl }}
                                </template>
                            </a>
                        </li>
                        <li v-if="experiment.attributes.status !== 'completed'">
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
                    </router-link>-->
                    <router-link to="/results" v-slot="{ href, navigate, isActive }">
                        <li :class="isActive ? 'is-active': ''" role="presentation">
                            <a :href="href" @keyup="keyboardNav" @click="navigate" tabindex="-1" role="menuitem">Results</a>
                        </li>
                    </router-link>
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
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import deepcopy from 'deepcopy';

import { Experiment } from '@/interfaces';
import AriaMenubar from '@/components/AriaMenubar.vue';

@Component({
  components: {
      AriaMenubar
  },
})
export default class App extends Vue {

    public get experiment(): Experiment | null {
        return this.$store.getters.experiment;
    }

    public get progress(): number {
        if (this.$store.state.ui.busyMaxCounter > 0) {
            return 100 / this.$store.state.ui.busyMaxCounter * (this.$store.state.ui.busyMaxCounter - this.$store.state.ui.busyCounter);
        } else {
            return -1;
        }
    }

    public mounted(): void {
        const configElement = document.getElementById('ExperimentEditorConfig');
        if (configElement) {
            const config = JSON.parse(configElement.innerHTML);
            if (config) {
                this.$store.dispatch('init', config);
            }
        }
    }

    public changeStatus(ev: Event): void {
        if (ev && ev.target && this.experiment) {
            const value = (ev.target as HTMLInputElement).value;
            let proceed = false;
            if (this.experiment.attributes.status === 'development' && value === 'live') {
                proceed = confirm('Switching the status to live makes the experiment publicly available. You cannot return to the development status. Please confirm you wish to make the experiment live.');
            } else if (this.experiment.attributes.status === 'live' && value === 'paused') {
                proceed = true;
            } else if (this.experiment.attributes.status === 'paused' && value === 'live') {
                proceed = true;
            } else if ((this.experiment.attributes.status === 'live' || this.experiment.attributes.status === 'paused') && value === 'completed') {
                proceed = confirm('Switching the status to completed ends the experiment. You cannot return to the live status. Please confirm you wish to complete the experiment.');
            }
            if (proceed) {
                const experiment = deepcopy(this.experiment);
                experiment.attributes.status = value;
                this.$store.dispatch('saveExperiment', experiment);
            } else {
                const oldStatus = this.experiment.attributes.status;
                this.experiment.attributes.status = '';
                this.$nextTick(() => {
                    if (this.experiment) {
                        this.experiment.attributes.status = oldStatus;
                    }
                });
            }
        }
    }
}
</script>
