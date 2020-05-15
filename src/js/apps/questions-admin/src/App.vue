<template>
    <div id="app" class="questions-admin">
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
        <router-view/>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
})
export default class App extends Vue {
    public mounted() {
        const configElement = document.getElementById('QuestionsAdminConfig');
        if (configElement) {
            const config = JSON.parse(configElement.innerHTML);
            if (config) {
                this.$store.dispatch('init', config);
            }
        }
    }
}
</script>
