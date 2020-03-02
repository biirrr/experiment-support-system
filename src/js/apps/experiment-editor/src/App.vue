<template>
    <div id="app" class="experiment-editor">
        <div v-if="$store.state.ui.busy" class="busy-overlay">
            <svg viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" fill-rule="evenodd">
                    <g transform="translate(1 1)" stroke-width="2">
                        <circle stroke-opacity=".5" cx="18" cy="18" r="18"/>
                        <path d="M36 18c0-9.94-8.06-18-18-18">
                            <animateTransform
                                attributeName="transform"
                                type="rotate"
                                from="0 18 18"
                                to="360 18 18"
                                dur="1s"
                                repeatCount="indefinite"/>
                        </path>
                    </g>
                </g>
            </svg>
        </div>
        <h1 v-if="experiment">{{ experiment.attributes.title }}</h1>
        <aria-menubar v-slot="{ keyboardNav }">
            <nav>
                <ul class="menu" role="menubar">
                    <li role="presentation">
                        <router-link to="/" v-slot="{ href, navigate, isActive }">
                            <a :href="href" :class="isActive ? 'is-active': ''" @keyup="keyboardNav" @click="navigate" tabindex="0" role="menuitem">Overview</a>
                        </router-link>
                    </li>
                    <li role="presentation">
                        <router-link to="/pages" v-slot="{ href, navigate, isActive }">
                            <a :href="href" :class="isActive ? 'is-active': ''" @keyup="keyboardNav" @click="navigate" tabindex="-1" role="menuitem">Pages</a>
                        </router-link>
                    </li>
                    <li role="presentation">
                        <router-link to="/data" v-slot="{ href, navigate, isActive }">
                            <a :href="href" :class="isActive ? 'is-active': ''" @keyup="keyboardNav" @click="navigate" tabindex="-1" role="menuitem">Data</a>
                        </router-link>
                    </li>
                    <li role="presentation">
                        <router-link to="/latin-squares" v-slot="{ href, navigate, isActive }">
                            <a :href="href" :class="isActive ? 'is-active': ''" @keyup="keyboardNav" @click="navigate" tabindex="-1" role="menuitem">Latin Squares</a>
                        </router-link>
                    </li>
                    <li role="presentation">
                        <router-link to="/results" v-slot="{ href, navigate, isActive }">
                            <a :href="href" :class="isActive ? 'is-active': ''" @keyup="keyboardNav" @click="navigate" tabindex="-1" role="menuitem">Results</a>
                        </router-link>
                    </li>
                    <li role="presentation">
                        <router-link to="/settings" v-slot="{ href, navigate, isActive }">
                            <a :href="href" :class="isActive ? 'is-active': ''" @keyup="keyboardNav" @click="navigate" tabindex="-1" role="menuitem">Settings</a>
                        </router-link>
                    </li>
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

    public mounted() {
        const configElement = document.getElementById('ExperimentEditorConfig');
        if (configElement) {
            const config = JSON.parse(configElement.innerHTML);
            if (config) {
                this.$store.commit('init', config);
                this.$store.dispatch('loadExperiment');
            }
        }
    }
}
</script>
