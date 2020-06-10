<template>
    <div id="app">
        <ul>
            <li v-for="questionTypeGroup in questionTypeGroups" :key="questionTypeGroup.id">
                {{ questionTypeGroup.title }}
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
    components: {
    },
})
export default class App extends Vue {
    get questionTypeGroups() {
        return this.$store.getters.questionTypeGroups;
    }

    mounted() {
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
